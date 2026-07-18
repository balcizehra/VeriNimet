import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST kabul edilir." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY tanımlı değil. .env dosyasını kontrol et." });
  }

  const { toplanti = [], ders = [], city = "", birim = "", hafta = "" } = req.body || {};

  if (toplanti.length === 0 && ders.length === 0) {
    return res.status(400).json({ error: "Analiz edilecek veri yok." });
  }

  try {
    const prompt = `
Sen bir sivil toplum kuruluşunun saha faaliyetlerini analiz eden bir asistansın.
Aşağıda ${city || "belirtilmeyen il"} ilinin ${birim || "belirtilmeyen birim"} biriminden,
${hafta || "belirtilmeyen hafta"} haftasına ait komisyon toplantısı ve haftalık ders verileri var.

Komisyon Toplantıları (lokasyon adı ve katılımcı sayısı):
${toplanti.map((t) => `- ${t.ad}: ${t.katilim} kişi`).join("\n") || "Veri yok"}

Haftalık Dersler (lokasyon adı ve katılımcı sayısı):
${ders.map((d) => `- ${d.ad}: ${d.katilim} kişi`).join("\n") || "Veri yok"}

Bu verilere dayanarak kısa, net bir Türkçe özet yaz:
- En yüksek ve en düşük katılımlı lokasyonları belirt
- Genel bir eğilim veya dikkat çekici bir nokta varsa vurgula
- Genel merkez koordinatörünün hızlıca karar alabilmesi için 3-4 cümleyi geçme
- Madde işareti kullanma, akıcı bir paragraf yaz
`.trim();

   const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });

    return res.status(200).json({ summary: response.text });
   } catch (err) {
    console.error("Gemini analiz hatası:", err);
    return res.status(500).json({ error: "Hata: " + (err?.message || String(err)) });
  }
}