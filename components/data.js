import { Building2, School, ClipboardList, Baby } from "lucide-react";

export const BIRIMLER = [
  { key: "universite", label: "Üniversite", icon: Building2 },
  { key: "lise", label: "Lise", icon: School },
  { key: "ortaokul", label: "Ortaokul", icon: ClipboardList },
  { key: "cocuk", label: "Çocuk", icon: Baby },
];

// Türkiye'nin 81 iline göre üniversite listesi.
// Hem DEVLET hem VAKIF üniversiteleri YÖK'ün resmi veritabanından
// (yok.gov.tr/university?type=1 ve type=2) doğrudan çekilip il eşleşmesiyle
// derlendi. Vakıf üniversiteleri sadece 12 ilde bulunuyor (YÖK verisine göre);
// diğer illerde sadece devlet üniversiteleri listelenir. Liste zamanla
// değişebilir (yeni üniversite açılışı/kapanışı) — formda her zaman
// "Diğer (yaz)" seçeneği de var.
export const UNI_BY_CITY = {
  Adana: ["Çukurova Üniversitesi", "Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi"],
  Adıyaman: ["Adıyaman Üniversitesi"],
  Afyonkarahisar: ["Afyon Kocatepe Üniversitesi", "Afyonkarahisar Sağlık Bilimleri Üniversitesi"],
  Ağrı: ["Ağrı İbrahim Çeçen Üniversitesi"],
  Aksaray: ["Aksaray Üniversitesi"],
  Amasya: ["Amasya Üniversitesi"],
  Ankara: [
    "Ankara Üniversitesi", "Gazi Üniversitesi", "Hacettepe Üniversitesi", "Orta Doğu Teknik Üniversitesi (ODTÜ)",
    "Ankara Yıldırım Beyazıt Üniversitesi", "Ankara Hacı Bayram Veli Üniversitesi", "Ankara Sosyal Bilimler Üniversitesi",
    "Ankara Müzik ve Güzel Sanatlar Üniversitesi", "Polis Akademisi", "Milli Savunma Üniversitesi",
    "İhsan Doğramacı Bilkent Üniversitesi", "TED Üniversitesi", "Atılım Üniversitesi", "Başkent Üniversitesi",
    "Çankaya Üniversitesi", "TOBB Ekonomi ve Teknoloji Üniversitesi", "Ankara Bilim Üniversitesi",
    "Ankara Medipol Üniversitesi", "Lokman Hekim Üniversitesi", "OSTİM Teknik Üniversitesi",
    "Türk Hava Kurumu Üniversitesi", "Ufuk Üniversitesi", "Yüksek İhtisas Üniversitesi",
  ],
  Antalya: ["Akdeniz Üniversitesi", "Alanya Alaaddin Keykubat Üniversitesi", "Alanya Üniversitesi", "Antalya Belek Üniversitesi", "Antalya Bilim Üniversitesi"],
  Ardahan: ["Ardahan Üniversitesi"],
  Artvin: ["Artvin Çoruh Üniversitesi"],
  Aydın: ["Aydın Adnan Menderes Üniversitesi"],
  Balıkesir: ["Balıkesir Üniversitesi", "Bandırma Onyedi Eylül Üniversitesi"],
  Bartın: ["Bartın Üniversitesi"],
  Batman: ["Batman Üniversitesi"],
  Bayburt: ["Bayburt Üniversitesi"],
  Bilecik: ["Bilecik Şeyh Edebali Üniversitesi"],
  Bingöl: ["Bingöl Üniversitesi"],
  Bitlis: ["Bitlis Eren Üniversitesi"],
  Bolu: ["Bolu Abant İzzet Baysal Üniversitesi"],
  Burdur: ["Burdur Mehmet Akif Ersoy Üniversitesi"],
  Bursa: ["Bursa Uludağ Üniversitesi", "Bursa Teknik Üniversitesi", "Mudanya Üniversitesi"],
  Çanakkale: ["Çanakkale Onsekiz Mart Üniversitesi"],
  Çankırı: ["Çankırı Karatekin Üniversitesi"],
  Çorum: ["Hitit Üniversitesi"],
  Denizli: ["Pamukkale Üniversitesi"],
  Diyarbakır: ["Dicle Üniversitesi"],
  Düzce: ["Düzce Üniversitesi"],
  Edirne: ["Trakya Üniversitesi"],
  Elazığ: ["Fırat Üniversitesi"],
  Erzincan: ["Erzincan Binali Yıldırım Üniversitesi"],
  Erzurum: ["Atatürk Üniversitesi", "Erzurum Teknik Üniversitesi"],
  Eskişehir: ["Anadolu Üniversitesi", "Eskişehir Osmangazi Üniversitesi", "Eskişehir Teknik Üniversitesi"],
  Gaziantep: ["Gaziantep Üniversitesi", "Gaziantep İslam Bilim ve Teknoloji Üniversitesi", "Hasan Kalyoncu Üniversitesi", "Sanko Üniversitesi"],
  Giresun: ["Giresun Üniversitesi"],
  Gümüşhane: ["Gümüşhane Üniversitesi"],
  Hakkari: ["Hakkari Üniversitesi"],
  Hatay: ["Hatay Mustafa Kemal Üniversitesi", "İskenderun Teknik Üniversitesi"],
  Iğdır: ["Iğdır Üniversitesi"],
  Isparta: ["Süleyman Demirel Üniversitesi", "Isparta Uygulamalı Bilimler Üniversitesi"],
  İstanbul: [
    "İstanbul Üniversitesi", "İstanbul Teknik Üniversitesi", "Boğaziçi Üniversitesi", "Marmara Üniversitesi",
    "Yıldız Teknik Üniversitesi", "İstanbul Medeniyet Üniversitesi", "İstanbul Üniversitesi-Cerrahpaşa",
    "Sağlık Bilimleri Üniversitesi", "Mimar Sinan Güzel Sanatlar Üniversitesi", "Galatasaray Üniversitesi",
    "Türk-Alman Üniversitesi", "Türkiye Uluslararası İslam, Bilim ve Teknoloji Üniversitesi",
    "Acıbadem Mehmet Ali Aydınlar Üniversitesi", "Altınbaş Üniversitesi", "Bahçeşehir Üniversitesi",
    "Beykoz Üniversitesi", "Bezm-i Âlem Vakıf Üniversitesi", "Biruni Üniversitesi", "Demiroğlu Bilim Üniversitesi",
    "Doğuş Üniversitesi", "Fatih Sultan Mehmet Vakıf Üniversitesi", "Fenerbahçe Üniversitesi", "Haliç Üniversitesi",
    "Işık Üniversitesi", "İbn Haldun Üniversitesi", "İstanbul 29 Mayıs Üniversitesi", "İstanbul Arel Üniversitesi",
    "İstanbul Atlas Üniversitesi", "İstanbul Aydın Üniversitesi", "İstanbul Beykent Üniversitesi",
    "İstanbul Bilgi Üniversitesi", "İstanbul Esenyurt Üniversitesi", "İstanbul Galata Üniversitesi",
    "İstanbul Gedik Üniversitesi", "İstanbul Gelişim Üniversitesi", "İstanbul Kent Üniversitesi",
    "İstanbul Kültür Üniversitesi", "İstanbul Medipol Üniversitesi", "İstanbul Nişantaşı Üniversitesi",
    "İstanbul Okan Üniversitesi", "İstanbul Rumeli Üniversitesi", "İstanbul Sabahattin Zaim Üniversitesi",
    "İstanbul Sağlık ve Teknoloji Üniversitesi", "İstanbul Ticaret Üniversitesi", "İstanbul Topkapı Üniversitesi",
    "İstanbul Yeni Yüzyıl Üniversitesi", "İstinye Üniversitesi", "Kadir Has Üniversitesi", "Koç Üniversitesi",
    "Maltepe Üniversitesi", "MEF Üniversitesi", "Özyeğin Üniversitesi", "Piri Reis Üniversitesi",
    "Sabancı Üniversitesi", "Üsküdar Üniversitesi", "Yeditepe Üniversitesi",
  ],
  İzmir: [
    "Ege Üniversitesi", "Dokuz Eylül Üniversitesi", "İzmir Katip Çelebi Üniversitesi", "İzmir Demokrasi Üniversitesi",
    "İzmir Bakırçay Üniversitesi", "İzmir Yüksek Teknoloji Enstitüsü",
    "İzmir Ekonomi Üniversitesi", "İzmir Tınaztepe Üniversitesi", "Yaşar Üniversitesi",
  ],
  Kahramanmaraş: ["Kahramanmaraş Sütçü İmam Üniversitesi", "Kahramanmaraş İstiklal Üniversitesi"],
  Karabük: ["Karabük Üniversitesi"],
  Karaman: ["Karamanoğlu Mehmetbey Üniversitesi"],
  Kars: ["Kafkas Üniversitesi"],
  Kastamonu: ["Kastamonu Üniversitesi"],
  Kayseri: ["Erciyes Üniversitesi", "Abdullah Gül Üniversitesi", "Kayseri Üniversitesi", "Nuh Naci Yazgan Üniversitesi"],
  Kilis: ["Kilis 7 Aralık Üniversitesi"],
  Kırıkkale: ["Kırıkkale Üniversitesi"],
  Kırklareli: ["Kırklareli Üniversitesi"],
  Kırşehir: ["Kırşehir Ahi Evran Üniversitesi"],
  Kocaeli: ["Kocaeli Üniversitesi", "Gebze Teknik Üniversitesi", "Kocaeli Sağlık ve Teknoloji Üniversitesi"],
  Konya: ["Selçuk Üniversitesi", "Necmettin Erbakan Üniversitesi", "Konya Teknik Üniversitesi", "Konya Gıda ve Tarım Üniversitesi", "KTO Karatay Üniversitesi"],
  Kütahya: ["Kütahya Dumlupınar Üniversitesi", "Kütahya Sağlık Bilimleri Üniversitesi"],
  Malatya: ["İnönü Üniversitesi", "Malatya Turgut Özal Üniversitesi"],
  Manisa: ["Manisa Celal Bayar Üniversitesi"],
  Mardin: ["Mardin Artuklu Üniversitesi"],
  Mersin: ["Mersin Üniversitesi", "Tarsus Üniversitesi", "Çağ Üniversitesi", "Toros Üniversitesi"],
  Muğla: ["Muğla Sıtkı Koçman Üniversitesi"],
  Muş: ["Muş Alparslan Üniversitesi"],
  Nevşehir: ["Nevşehir Hacı Bektaş Veli Üniversitesi", "Kapadokya Üniversitesi"],
  Niğde: ["Niğde Ömer Halisdemir Üniversitesi"],
  Ordu: ["Ordu Üniversitesi"],
  Osmaniye: ["Osmaniye Korkut Ata Üniversitesi"],
  Rize: ["Recep Tayyip Erdoğan Üniversitesi"],
  Sakarya: ["Sakarya Üniversitesi", "Sakarya Uygulamalı Bilimler Üniversitesi"],
  Samsun: ["Ondokuz Mayıs Üniversitesi", "Samsun Üniversitesi"],
  Siirt: ["Siirt Üniversitesi"],
  Sinop: ["Sinop Üniversitesi"],
  Sivas: ["Sivas Cumhuriyet Üniversitesi", "Sivas Bilim ve Teknoloji Üniversitesi"],
  Şanlıurfa: ["Harran Üniversitesi"],
  Şırnak: ["Şırnak Üniversitesi"],
  Tekirdağ: ["Tekirdağ Namık Kemal Üniversitesi"],
  Tokat: ["Tokat Gaziosmanpaşa Üniversitesi"],
  Trabzon: ["Karadeniz Teknik Üniversitesi", "Trabzon Üniversitesi", "Avrasya Üniversitesi"],
  Tunceli: ["Munzur Üniversitesi"],
  Uşak: ["Uşak Üniversitesi"],
  Van: ["Van Yüzüncü Yıl Üniversitesi"],
  Yalova: ["Yalova Üniversitesi"],
  Yozgat: ["Yozgat Bozok Üniversitesi"],
  Zonguldak: ["Zonguldak Bülent Ecevit Üniversitesi"],
};

// Listede olmayan bir il gelirse boş liste döner — form yine de
// "Diğer (yaz)" seçeneğiyle devam eder.
// Liste her zaman Türkçe alfabetik sırayla döner (data içindeki sıra
// önemli değil, gösterimde otomatik sıralanır).
export function genericUni(city) {
  const list = UNI_BY_CITY[city] || [];
  return [...list].sort((a, b) => a.localeCompare(b, "tr"));
}

export const OKUL_TUR = ["Fen Lisesi", "Anadolu Lisesi", "İmam Hatip Lisesi", "Sosyal Bilimler Lisesi", "Mesleki ve Teknik Lise", "Diğer"];

// 81 il — hem il başkanı giriş dropdown'ı hem de admin panel filtreleri için.
export const TUM_ILLER = Object.keys(UNI_BY_CITY).sort((a, b) => a.localeCompare(b, "tr"));