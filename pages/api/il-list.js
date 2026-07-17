import prisma from "../../lib/prisma";
import { requireRole } from "../../lib/auth";

export default requireRole(async function handler(req, res) {
  const iller = await prisma.il.findMany({ select: { ad: true }, orderBy: { ad: "asc" } });
  res.status(200).json({ iller: iller.map((i) => i.ad) });
}, "admin");
