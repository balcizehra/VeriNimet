import prisma from "../../../lib/prisma";
import { requireRole } from "../../../lib/auth";
import { gecerliHaftaMi } from "../../../lib/hafta";

// Admin panelindeki hafta dropdown'u: yalnızca gerçekten rapor girilmiş
// haftaları listeler (en yeniden en eskiye).
export default requireRole(async function handler(req, res) {
  const { il, birim } = req.query;
  const where = {};
  if (il) where.il = il;
  if (birim) where.birim = birim;

  const kayitlar = await prisma.rapor.findMany({
    where, select: { hafta: true }, distinct: ["hafta"], orderBy: { hafta: "desc" },
  });

  const haftalar = kayitlar.map((k) => k.hafta).filter(gecerliHaftaMi);
  res.status(200).json({ haftalar });
}, "admin");