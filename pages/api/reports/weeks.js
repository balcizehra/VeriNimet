import prisma from "../../../lib/prisma";
import { requireRole } from "../../../lib/auth";

export default requireRole(async function handler(req, res) {
  const { il, birim } = req.query;

  const where = {};
  if (il) where.il = il;
  if (birim) where.birim = birim;

  const kayitlar = await prisma.rapor.findMany({
    where,
    select: { hafta: true },
    distinct: ["hafta"],
    orderBy: { hafta: "desc" },
  });

  res.status(200).json({ haftalar: kayitlar.map((k) => k.hafta) });
}, "admin");