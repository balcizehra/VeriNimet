import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";
import { createSessionCookie } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { tip, kullaniciAdi, sifre } = req.body || {};

  if (!tip || !sifre) return res.status(400).json({ error: "Eksik bilgi." });

  if (tip === "il") {
    const il = await prisma.il.findUnique({ where: { ad: kullaniciAdi } });
    if (!il) return res.status(401).json({ error: "İl bulunamadı." });
    const ok = await bcrypt.compare(sifre, il.sifreHash);
    if (!ok) return res.status(401).json({ error: "Şifre hatalı." });

    res.setHeader("Set-Cookie", createSessionCookie({ role: "il", il: il.ad }));
    return res.status(200).json({ role: "il", il: il.ad });
  }

  if (tip === "admin") {
    const admin = await prisma.admin.findUnique({ where: { kullaniciAdi } });
    if (!admin) return res.status(401).json({ error: "Kullanıcı bulunamadı." });
    const ok = await bcrypt.compare(sifre, admin.sifreHash);
    if (!ok) return res.status(401).json({ error: "Şifre hatalı." });

    res.setHeader("Set-Cookie", createSessionCookie({ role: "admin", kullaniciAdi: admin.kullaniciAdi }));
    return res.status(200).json({ role: "admin" });
  }

  return res.status(400).json({ error: "Geçersiz giriş tipi." });
}
