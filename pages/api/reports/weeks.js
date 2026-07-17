import prisma from "../../../lib/prisma";
import { requireRole } from "../../../lib/auth";

export default requireRole(async function handler(req, res) {
  const { il, birim } = req.query;
  if (!il || !birim) return res.status(400).json({ error: "il ve birim zorunlu." });

  const kayitlar = await prisma.rapor.findMany({
    where: { il, birim },
    select: { hafta: true },
    orderBy: { hafta: "desc" },
  });

  res.status(200).json({ haftalar: kayitlar.map((k) => k.hafta) });
}, "admin");
