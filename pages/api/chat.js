import { GoogleGenAI } from "@google/genai";
import prisma from "../../lib/prisma";
import { requireRole } from "../../lib/auth";
import { haftaEtiketiGoster } from "../../lib/hafta";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const BIRIM_ETIKET = { universite: "Üniversite", lise: "Lise", ortaokul: "Ortaokul", cocuk: "Çocuk" };

// Tüm raporları çekip, il + birim bazında toplam katılım/lokasyon sayısına
// indirger. Ham veriyi olduğu gibi göndermek yerine özetlemek, hem Gemini'ye
// giden veriyi küçültür hem de modelin toplama/karşılaştırma hatası yapmasını
// engeller (toplamlar burada, kod tarafında, kesin olarak hesaplanıyor).
async function veriOzeti() {
  const raporlar = await prisma.rapor.findMany({ include: { lokasyonlar: true } });

  const ilBirimMap = {};
  const haftaSet = new Set();
  let genelToplamKatilim = 0;
  let genelToplamLokasyon = 0;

  for (const r of raporlar) {
    haftaSet.add(r.hafta);
    const key = `${r.il}|${r.birim}`;
    if (!ilBirimMap[key]) {
      ilBirimMap[key] = {
        il: r.il,
        birim: BIRIM_ETIKET[r.birim] || r.birim,
        toplantiKatilim: 0,
        toplantiLokasyon: 0,
        dersKatilim: 0,
        dersLokasyon: 0,
      };
    }
    for (const l of r.lokasyonlar) {
      const kisi = Number(l.katilim) || 0;
      genelToplamKatilim += kisi;
      genelToplamLokasyon += 1;
      if (l.tip === "toplanti") {
        ilBirimMap[key].toplantiKatilim += kisi;
        ilBirimMap[key].toplantiLokasyon += 1;
      } else if (l.tip === "ders") {
        ilBirimMap[key].dersKatilim += kisi;
        ilBirimMap[key].dersLokasyon += 1;
      }
    }
  }

  const satirlar = Object.values(ilBirimMap).sort((a, b) => a.il.localeCompare(b.il, "tr"));
  const haftalar = [...haftaSet].sort();

  return {
    satirlar,
    haftalar,
    genelToplamKatilim,
    genelToplamLokasyon,
    haftaAraligi: haftalar.length
      ? `${haftaEtiketiGoster(haftalar[0])} — ${haftaEtiketiGoster(haftalar[haftalar.length - 1])}`
      : "Veri yok",
  };
}

export default requireRole(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST kabul edilir." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY tanımlı değil." });
  }

  const { question } = req.body || {};
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Soru boş olamaz." });
  }

  try {
    const ozet = await veriOzeti();

    if (ozet.satirlar.length === 0) {
      return res.status(200).json({
        answer: "Veritabanında henüz hiç rapor girilmemiş, bu yüzden bir analiz yapamıyorum.",
      });
    }

    const veriMetni = ozet.satirlar
      .map(
        (s) =>
          `- ${s.il} / ${s.birim}: Komisyon Toplantısı → ${s.toplantiKatilim} kişi (${s.toplantiLokasyon} lokasyon); Haftalık Ders → ${s.dersKatilim} kişi (${s.dersLokasyon} lokasyon)`
      )
      .join("\n");

    const prompt = `
Sen Genç İHH'nın saha faaliyetlerini analiz eden bir asistansın. Genel merkez
koordinatörüne, aşağıdaki veritabanı özetine dayanarak sorularını cevaplıyorsun.

VERİ KAPSAMI: ${ozet.haftaAraligi}
GENEL TOPLAM KATILIM: ${ozet.genelToplamKatilim} kişi
GENEL TOPLAM LOKASYON: ${ozet.genelToplamLokasyon}

İL VE BİRİM BAZINDA DETAY (tüm haftaların toplamı):
${veriMetni}

Kurallar:
- Sadece yukarıdaki veriye dayanarak cevap ver, veride olmayan rakam uydurma.
- Türkiye'nin illeri, nüfusu, coğrafyası gibi genel bilgi soruları gelirse (örn.
  "bu ilin nüfusu ne kadar" gibi kıyaslama/bağlam soruları) genel bilgini
  kullanabilirsin, ama bunu veritabanı rakamlarıyla karıştırma, hangisinin
  veritabanından hangisinin genel bilgiden geldiğini net ayır.
- Kısa ve net cevap ver, gereksiz uzatma.
- Türkçe cevap ver.

Kullanıcının sorusu: "${question.trim()}"
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });

    return res.status(200).json({ answer: response.text });
  } catch (err) {
    console.error("Chatbot hatası:", err);
    return res.status(500).json({ error: "Hata: " + (err?.message || String(err)) });
  }
}, "admin");