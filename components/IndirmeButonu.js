import { useState } from "react";
import { Download } from "lucide-react";

// Sayfanın o anki görünümünü (aktif filtreler neyse) A4 ölçüsünde,
// kenar boşluğu olmadan tam sayfaya oturan bir PDF olarak indirir.
// İçerik A4'ten uzunsa otomatik olarak birden fazla sayfaya bölünür.
// Bu bileşen sayfanın kendi header'ı içine, diğer üst-sağ butonların
// yanına gömülerek kullanılır (bkz. admin.js / analytics.js).
export default function IndirmeButonu({ style }) {
  const [yukleniyor, setYukleniyor] = useState(false);

  async function pdfIndir() {
    if (yukleniyor) return;
    setYukleniyor(true);

    const alan = document.getElementById("capture-root");
    if (!alan) {
      alert("İndirilecek alan bulunamadı.");
      setYukleniyor(false);
      return;
    }

    // PDF'e dahil edilmemesi gereken elemanları (bu buton dahil) geçici gizle
    const gizlenecekler = alan.querySelectorAll('[data-pdf-ignore="true"]');
    const oncekiGorunurluk = [];
    gizlenecekler.forEach((el) => { oncekiGorunurluk.push(el.style.visibility); el.style.visibility = "hidden"; });

    try {
      const [{ default: html2canvas }, jsPDFModul] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const { jsPDF } = jsPDFModul;

      const canvas = await html2canvas(alan, {
        backgroundColor: "#F5F7F6",
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Görseli A4 genişliğine tam oturt (kenar boşluğu yok), oranı koru
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let kalanYukseklik = imgHeight;
      let konum = 0;

      pdf.addImage(imgData, "PNG", 0, konum, imgWidth, imgHeight);
      kalanYukseklik -= pageHeight;

      // İçerik bir A4 sayfasından uzunsa devamını yeni sayfalara ekle
      while (kalanYukseklik > 0) {
        konum = kalanYukseklik - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, konum, imgWidth, imgHeight);
        kalanYukseklik -= pageHeight;
      }

      const tarih = new Date().toISOString().slice(0, 10);
      const sayfaAdi = (window.location.pathname.replace(/^\//, "").replace(/\//g, "-") || "genc-ihh");
      pdf.save(`${sayfaAdi}-${tarih}.pdf`);
    } catch (err) {
      console.error("PDF indirme hatası:", err);
      alert("PDF indirilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      gizlenecekler.forEach((el, i) => { el.style.visibility = oncekiGorunurluk[i]; });
      setYukleniyor(false);
    }
  }

  return (
    <button
      onClick={pdfIndir}
      title="Bu sayfayı PDF olarak indir"
      aria-label="Sayfayı PDF olarak indir"
      data-pdf-ignore="true"
      disabled={yukleniyor}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        padding: 0,
        borderRadius: 10,
        border: "1px solid #E1E8E7",
        background: "#FBFCFC",
        cursor: yukleniyor ? "wait" : "pointer",
        flexShrink: 0,
        ...style,
      }}
    >
      <Download size={15} color="#17A673" style={{ opacity: yukleniyor ? 0.45 : 1 }} strokeWidth={2.2} />
    </button>
  );
}