import { requireRole } from "../../../lib/auth";
import { tumHaftalar } from "../../../lib/hafta";

// Admin panelindeki hafta dropdown'u: veri olsun olmasın, 1. haftadan güncel
// haftaya kadar TÜM haftaları listeler (en yeniden en eskiye). Hangi haftalarda
// gerçekten veri olduğu, seçim yapıldıktan sonra /api/reports üzerinden anlaşılır.
export default requireRole(async function handler(req, res) {
  const { il, birim } = req.query;
  if (!il || !birim) return res.status(400).json({ error: "il ve birim zorunlu." });

  res.status(200).json({ haftalar: tumHaftalar() });
}, "admin");