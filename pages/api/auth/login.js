import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";
import { createSessionCookie } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  
  // Arayüzden artık tip gelmiyor, sadece kullaniciAdi (ID) ve sifre geliyor
  const { kullaniciAdi, sifre } = req.body || {};

  if (!kullaniciAdi || !sifre) {
    return res.status(400).json({ error: "Eksik bilgi." });
  }

  // 1. ADIM: Önce Admin (Genel Merkez) girişi mi yapılmak isteniyor diye bak
  if (kullaniciAdi === "genelmerkez") {
    const admin = await prisma.admin.findUnique({ where: { kullaniciAdi } });
    if (!admin) return res.status(401).json({ error: "Kullanıcı bulunamadı." });
    
    const ok = await bcrypt.compare(sifre, admin.sifreHash);
    if (!ok) return res.status(401).json({ error: "Şifre hatalı." });

    res.setHeader("Set-Cookie", createSessionCookie({ role: "admin", kullaniciAdi: admin.kullaniciAdi }));
    return res.status(200).json({ role: "admin", isAdmin: true });
  }

  // 2. ADIM: Eğer genelmerkez değilse, bunu bir İL KODU (Örn: 042, 034) olarak ara
  const il = await prisma.il.findUnique({ where: { kod: kullaniciAdi } });
  
  if (!il) {
    return res.status(401).json({ error: "Geçersiz Kullanıcı ID veya İl bulunamadı." });
  }

  // 3. ADIM: İl şifresini doğrula
  const ok = await bcrypt.compare(sifre, il.sifreHash);
  if (!ok) return res.status(401).json({ error: "Şifre hatalı." });

  // Giriş başarılı; çerezleri kaydet ve ön yüze il ismini döndür
  res.setHeader("Set-Cookie", createSessionCookie({ role: "il", il: il.ad }));
  return res.status(200).json({ role: "il", il: il.ad });
}