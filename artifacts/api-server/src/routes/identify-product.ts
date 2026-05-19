import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/identify-product", upload.single("image"), async (req, res) => {
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

  const prompt = `Bạn là AI nhận dạng sản phẩm hàng hóa tại tạp hóa Việt Nam.

Nhìn vào ảnh và xác định sản phẩm chính trong ảnh. Trả về thông tin sản phẩm dưới dạng JSON thuần — không markdown, không giải thích.

Cấu trúc JSON cần trả về:
{
  "name": "Tên đầy đủ của sản phẩm (bao gồm thương hiệu, trọng lượng/thể tích nếu thấy được)",
  "price": <giá bán lẻ phổ biến ở Việt Nam tính bằng VND, là số nguyên, ví dụ 25000>,
  "description": "Mô tả ngắn (tối đa 1 câu, có thể để trống nếu không biết)",
  "quantity": "Đơn vị bán thường gặp, ví dụ: 1 chai, 1 gói, 1 hộp (để trống nếu không chắc)"
}

Lưu ý:
- Tên sản phẩm: viết bằng tiếng Việt, đầy đủ thương hiệu và khối lượng nếu nhìn thấy trên bao bì
- Giá: ước tính giá bán lẻ tại tạp hóa Việt Nam (không phải giá sỉ), nếu không biết chính xác hãy ước tính gần đúng
- Nếu ảnh không rõ hoặc không phải sản phẩm hàng hóa, trả về: {"name":"","price":0,"description":"","quantity":""}`;

  const ai = new GoogleGenAI({ apiKey });

  req.log.info({ imageBytes: imageBase64.length }, "Starting product identification");

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

    const rawText = response.text?.trim() ?? "";
    const clean = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let result: { name: string; price: number; description: string; quantity: string };
    try {
      result = JSON.parse(clean);
    } catch {
      req.log.warn({ rawText: rawText.slice(0, 300) }, "Could not parse identify response");
      res.status(502).json({ error: "AI trả về kết quả không hợp lệ", raw: rawText.slice(0, 200) });
      return;
    }

    req.log.info({ name: result.name, price: result.price }, "Product identified");
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Gemini identify failed");
    res.status(500).json({ error: "AI không thể phân tích ảnh. Vui lòng thử lại." });
  }
});

export default router;
