import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import { db } from "@workspace/db";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/scan-products", upload.single("image"), async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    return;
  }

  let imageBase64: string;
  let mimeType: string;

  if (req.file) {
    imageBase64 = req.file.buffer.toString("base64");
    mimeType = req.file.mimetype || "image/jpeg";
  } else {
    const body = req.body as { imageBase64?: string; mimeType?: string };
    if (!body.imageBase64) {
      res.status(400).json({ error: "Cần gửi ảnh qua multipart hoặc imageBase64" });
      return;
    }
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType || "image/jpeg";
  }

  const products = await db.query.products.findMany({ orderBy: (p, { asc }) => [asc(p.name)] });

  if (products.length === 0) {
    res.json({ items: [], message: "Chưa có sản phẩm nào trong kho" });
    return;
  }

  const productList = products
    .map((p) => `- ID ${p.id}: "${p.name}"${p.quantity ? ` (${p.quantity})` : ""}`)
    .join("\n");

  const prompt = `Bạn là AI nhận dạng sản phẩm tại quầy tạp hóa Việt Nam.

DANH SÁCH SẢN PHẨM TRONG KHO:
${productList}

NHIỆM VỤ:
Nhìn vào ảnh và xác định những sản phẩm nào trong danh sách trên xuất hiện trong ảnh, đồng thời ước tính số lượng.

QUY TẮC:
- Chỉ nhận dạng sản phẩm có trong DANH SÁCH TRONG KHO ở trên (dùng đúng ID)
- Nếu không thấy rõ hoặc không chắc → bỏ qua, đừng đoán sai
- Số lượng: đếm số đơn vị nhìn thấy (hộp, gói, chai...), mặc định là 1 nếu không đếm được
- Ưu tiên sản phẩm nhìn rõ và có thể nhận dạng chính xác

Trả về JSON thuần — không markdown, không giải thích:
[{"productId": 1, "quantity": 2}, ...]

Nếu không nhận dạng được sản phẩm nào: []`;

  const ai = new GoogleGenAI({ apiKey });

  req.log.info({ productCount: products.length, imageBytes: imageBase64.length }, "Starting product scan");

  let rawText = "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      }],
      config: { temperature: 0 },
    });
    rawText = response.text?.trim() ?? "";
  } catch (err) {
    req.log.error({ err }, "Gemini scan failed");
    res.status(500).json({ error: "AI không thể phân tích ảnh. Vui lòng thử lại." });
    return;
  }

  let detected: { productId: number; quantity: number }[];
  try {
    const clean = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    detected = JSON.parse(clean);
    if (!Array.isArray(detected)) throw new Error("not array");
  } catch {
    req.log.warn({ rawText: rawText.slice(0, 300) }, "Could not parse scan response");
    res.status(502).json({ error: "AI trả về kết quả không hợp lệ", raw: rawText.slice(0, 200) });
    return;
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const items = detected
    .filter((d) => productMap.has(d.productId) && d.quantity > 0)
    .map((d) => ({
      productId: d.productId,
      productName: productMap.get(d.productId)!.name,
      quantity: Math.max(1, Math.round(d.quantity)),
      unitPrice: productMap.get(d.productId)!.price,
    }));

  req.log.info({ detectedCount: items.length }, "Scan complete");
  res.json({ items });
});

export default router;
