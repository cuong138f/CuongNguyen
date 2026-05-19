import { Router } from "express";
import { db } from "@workspace/db";
import { products } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parseResult = ListProductsQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }
  const { search } = parseResult.data;
  const rows = await db
    .select()
    .from(products)
    .where(search ? ilike(products.name, `%${search}%`) : undefined)
    .orderBy(products.createdAt);
  res.json(rows.map(toDto));
});

router.post("/", async (req, res) => {
  const parseResult = CreateProductBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }
  const data = parseResult.data;
  const [created] = await db
    .insert(products)
    .values({
      name: data.name,
      price: data.price,
      description: data.description ?? null,
      quantity: data.quantity ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .returning();
  res.status(201).json(toDto(created));
});

router.get("/stats", async (_req, res) => {
  const rows = await db.select().from(products);
  const totalProducts = rows.length;
  const avgPrice = totalProducts > 0 ? Math.round(rows.reduce((s, r) => s + r.price, 0) / totalProducts) : 0;
  const totalValue = rows.reduce((s, r) => {
    const numericQty = r.quantity ? parseFloat(r.quantity.replace(/[^\d.]/g, "")) : 0;
    return s + r.price * (numericQty || 1);
  }, 0);
  const lowStockCount = rows.filter((r) => !r.quantity || r.quantity.trim() === "").length;
  res.json({ totalProducts, totalValue: Math.round(totalValue), avgPrice, lowStockCount });
});

router.get("/:id", async (req, res) => {
  const parseResult = GetProductParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db.select().from(products).where(eq(products.id, parseResult.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toDto(row));
});

router.put("/:id", async (req, res) => {
  const paramsResult = UpdateProductParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyResult = UpdateProductBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.message });
    return;
  }
  const data = bodyResult.data;
  const [updated] = await db
    .update(products)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      updatedAt: new Date(),
    })
    .where(eq(products.id, paramsResult.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toDto(updated));
});

router.delete("/:id", async (req, res) => {
  const parseResult = DeleteProductParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const result = await db.delete(products).where(eq(products.id, parseResult.data.id)).returning();
  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});

function toDto(row: typeof products.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description ?? null,
    quantity: row.quantity ?? null,
    imageUrl: row.imageUrl ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export default router;
