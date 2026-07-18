// Haftalık raporlama sistemi — kurumun kendi haftalık döngüsüne göre hafta hesaplama.
// Tüm hafta mantığı burada toplanır; formu, admin panelini ve API'yi bu dosyadaki
// fonksiyonlar besler, hesaplama başka hiçbir yerde tekrarlanmaz.
//
// Genel kural:
// - 1. dönemin 1. haftası = 22-28 Haziran 2026 (Pazartesi-Pazar).
// - Her 7 günde bir hafta sayısı 1 artar.
// - Her yıl Eylül ayının ilk Pazartesi'sinde dönem sıfırlanır: yeni bir dönem başlar,
//   hafta sayısı yeniden 1'den başlar. Önceki dönemin haftalarıyla çakışmasın diye
//   etikette bir "dönem" numarası da tutulur: "D01H0004" (1. dönem, 4. hafta).

const BASLANGIC = new Date(Date.UTC(2026, 5, 22)); // 1. dönemin başlangıcı: 22 Haziran 2026 Pazartesi
const GUN_MS = 24 * 60 * 60 * 1000;

const AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const HAFTA_REGEX = /^(\d{4})-W(\d{2})$/;
// "Şu an" dediğimizde hangi tarihi kullanacağımızı belirler. Normalde gerçek
// bilgisayar saatini kullanır, ama .env dosyasında NEXT_PUBLIC_TEST_TARIH
// tanımlıysa onu kullanır (test amaçlı). NEXT_PUBLIC_ ön eki sayesinde bu
// değer hem sunucu (API) hem tarayıcı (form/admin) tarafında aynı anda okunur.
export function simdikiTarih() {
  const testTarih = process.env.NEXT_PUBLIC_TEST_TARIH;
  if (testTarih) return new Date(testTarih);
  return new Date();
}

export function gecerliHaftaMi(h) {
  return HAFTA_REGEX.test(h || "");
}

// "2026-W29" -> "29. Hafta"
export function haftaGoster(h) {
  const m = HAFTA_REGEX.exec(h || "");
  if (!m) return "";
  return `${parseInt(m[2], 10)}. Hafta`;
}

// "2026-W29" -> "29. Hafta · 2026"
export function haftaGosterUzun(h) {
  const m = HAFTA_REGEX.exec(h || "");
  if (!m) return "";
  return `${parseInt(m[2], 10)}. Hafta · ${m[1]}`;
}

// Verilen tarihi, o haftanın Pazartesi gününe (00:00 UTC) yuvarlar. (İç yardımcı fonksiyon.)
function haftaBasiPazartesi(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const gunNo = d.getUTCDay() || 7; // Pazartesi=1 ... Pazar=7
  d.setUTCDate(d.getUTCDate() - (gunNo - 1));
  return d;
}

// Verilen yılın Eylül ayındaki ilk Pazartesi'sini döner — o yılın dönem sıfırlama günü.
function ilkPazartesiEylul(yil) {
  const d = new Date(Date.UTC(yil, 8, 1)); // 1 Eylül
  const gunNo = d.getUTCDay() || 7;
  const fark = (1 - gunNo + 7) % 7;
  d.setUTCDate(d.getUTCDate() + fark);
  return d;
}

// 1. dönemden başlayarak, verilen dönem numarasının başlangıç Pazartesi'sini bulur.
function donemBasiByNo(donemNo) {
  let basi = BASLANGIC;
  for (let i = 1; i < donemNo; i++) {
    let sonraki = ilkPazartesiEylul(basi.getUTCFullYear());
    if (sonraki <= basi) sonraki = ilkPazartesiEylul(basi.getUTCFullYear() + 1);
    basi = sonraki;
  }
  return basi;
}

// Tamamlanmış bir dönemin toplam kaç hafta sürdüğünü hesaplar (bir sonraki
// dönemin başlangıcına kadar).
function donemHaftaSayisi(donemNo) {
  const basi = donemBasiByNo(donemNo);
  const sonrakiBasi = donemBasiByNo(donemNo + 1);
  return Math.round((sonrakiBasi - basi) / GUN_MS / 7);
}

// Verilen tarihin hangi döneme düştüğünü ve o dönemin kaçıncı haftası
// olduğunu bulur.
function donemVeHaftaNo(date) {
  const hedefPazartesi = haftaBasiPazartesi(date);

  let donemBasi = BASLANGIC;
  let donemNo = 1;

  while (true) {
    let sonrakiSifirlama = ilkPazartesiEylul(donemBasi.getUTCFullYear());
    if (sonrakiSifirlama <= donemBasi) {
      sonrakiSifirlama = ilkPazartesiEylul(donemBasi.getUTCFullYear() + 1);
    }
    if (sonrakiSifirlama > hedefPazartesi) break;
    donemBasi = sonrakiSifirlama;
    donemNo += 1;
  }

  const farkGun = Math.round((hedefPazartesi - donemBasi) / GUN_MS);
  const haftaNo = Math.floor(farkGun / 7) + 1;
  return { donemNo, donemBasi, haftaNo: Math.max(1, haftaNo) };
}

// Dönem + hafta sayısını sabit uzunlukta bir koda çevirir: "D01H0004".
// Veritabanında metin olarak sıralandığında da doğru sırayı verir.
export function haftaEtiketiFromNo(donemNo, haftaNo) {
  return `D${String(donemNo).padStart(2, "0")}H${String(haftaNo).padStart(4, "0")}`;
}

// Asıl hesaplayıcı: verilen tarihin (varsayılan: simdikiTarih()) hafta etiketini döner.
export function guncelHaftaEtiketi(date = simdikiTarih()) {
  const { donemNo, haftaNo } = donemVeHaftaNo(date);
  return haftaEtiketiFromNo(donemNo, haftaNo);
}

// Sadece o dönem içindeki hafta sayısını döner (dönem numarası olmadan), örn. 4.
export function guncelHaftaNo(date = simdikiTarih()) {
  return donemVeHaftaNo(date).haftaNo;
}

// Verilen tarihin hangi dönemde olduğunu döner, örn. 1.
export function guncelDonemNo(date = simdikiTarih()) {
  return donemVeHaftaNo(date).donemNo;
}

// "D01H0004" etiketini alıp o haftanın başlangıç ve bitiş tarihlerini
// (Pazartesi/Pazar) ve dönem/hafta numaralarını döner.
export function haftaDetay(haftaEtiketi) {
  const eslesme = String(haftaEtiketi).match(/^D(\d+)H(\d+)$/);
  if (!eslesme) return null;
  const donemNo = parseInt(eslesme[1], 10);
  const haftaNo = parseInt(eslesme[2], 10);
  const donemBasi = donemBasiByNo(donemNo);
  const bas = new Date(donemBasi.getTime() + (haftaNo - 1) * 7 * GUN_MS);
  const bit = new Date(bas.getTime() + 6 * GUN_MS);
  return { donemNo, haftaNo, bas, bit };
}

// "D01H0004" -> "4. Hafta · 13-19 Tem" gibi insan gözü için okunur metin.
export function haftaEtiketiGoster(haftaEtiketi) {
  const detay = haftaDetay(haftaEtiketi);
  if (!detay) return haftaEtiketi;
  const { haftaNo, bas, bit } = detay;
  const araligi =
    bas.getUTCMonth() === bit.getUTCMonth()
      ? `${bas.getUTCDate()}-${bit.getUTCDate()} ${AYLAR[bas.getUTCMonth()]}`
      : `${bas.getUTCDate()} ${AYLAR[bas.getUTCMonth()]} - ${bit.getUTCDate()} ${AYLAR[bit.getUTCMonth()]}`;
  return `${haftaNo}. Hafta · ${araligi}`;
}

// 1. dönem 1. haftadan, güncel dönem/haftaya kadar TÜM hafta etiketlerini,
// en yeniden en eskiye sıralı bir liste olarak döner (veri olsun olmasın).
// Dropdown'ların (açılır listelerin) seçenekleri buradan geliyor.
export function tumHaftalar(date = simdikiTarih()) {
  const { donemNo: guncelDonem, haftaNo: guncelHafta } = donemVeHaftaNo(date);
  const liste = [];
  for (let d = guncelDonem; d >= 1; d--) {
    const sonHafta = d === guncelDonem ? guncelHafta : donemHaftaSayisi(d);
    for (let h = sonHafta; h >= 1; h--) {
      liste.push(haftaEtiketiFromNo(d, h));
    }
  }
  return liste;
}