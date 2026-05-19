import { Router } from "express";
import { db } from "@workspace/db";
import { sales, saleItems } from "@workspace/db";
import { eq, gte, sum, count } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const SaleItemInput = z.object({
  productId: z.number().int().positive().optional(),
  productName: z.string().min(1),
  unitPrice: z.number().int().min(0),
  quantity: z.number().int().min(1),
});

const SaleInput = z.object({
  note: z.string().optional(),
  items: z.array(SaleItemInput).min(1),
});

router.get("/", async (req, res) => {
  const rows = await db
    .select()
    .from(sales)
    .orderBy(sales.createdAt);

  const allItems = await db.select().from(saleItems);

  const result = rows.map((s) => ({
    id: s.id,
    note: s.note ?? null,
    totalAmount: s.totalAmount,
    createdAt: s.createdAt.toISOString(),
    items: allItems
      .filter((i) => i.saleId === s.id)
      .map((i) => ({
        id: i.id,
        productId: i.productId ?? null,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        subtotal: i.subtotal,
      })),
  }));

  res.json(result.reverse());
});

router.get("/revenue", async (_req, res) => {
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const allSales = await db.select().from(sales);

  const sumFor = (from: Date) =>
    allSales
      .filter((s) => s.createdAt >= from)
      .reduce((acc, s) => acc + s.totalAmount, 0);

  const countFor = (from: Date) =>
    allSales.filter((s) => s.createdAt >= from).length;

  res.json({
    today: sumFor(startOfToday),
    thisWeek: sumFor(startOfWeek),
    thisMonth: sumFor(startOfMonth),
    allTime: allSales.reduce((acc, s) => acc + s.totalAmount, 0),
    todayCount: countFor(startOfToday),
    thisWeekCount: countFor(startOfWeek),
    thisMonthCount: countFor(startOfMonth),
    allTimeCount: allSales.length,
  });
});

router.post("/", async (req, res) => {
  const parseResult = SaleInput.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }

  const { note, items } = parseResult.data;
  const totalAmount = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

  const [created] = await db
    .insert(sales)
    .values({ note: note ?? null, totalAmount })
    .returning();

  await db.insert(saleItems).values(
    items.map((i) => ({
      saleId: created.id,
      productId: i.productId ?? null,
      productName: i.productName,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      subtotal: i.unitPrice * i.quantity,
    }))
  );

  const itemRows = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, created.id));

  res.status(201).json({
    id: created.id,
    note: created.note ?? null,
    totalAmount: created.totalAmount,
    createdAt: created.createdAt.toISOString(),
    items: itemRows.map((i) => ({
      id: i.id,
      productId: i.productId ?? null,
      productName: i.productName,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
  });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(saleItems).where(eq(saleItems.saleId, id));
  const result = await db.delete(sales).where(eq(sales.id, id)).returning();

  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(204).send();
});

export default router;
