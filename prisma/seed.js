// Başlangıç verisi: her il için kurumsal hesap + 1 admin hesabı oluşturur.
// Çalıştır: npm run db:seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Türkiye'nin 81 ili — components/data.js içindeki üniversite listesiyle birebir eşleşir.
const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya",
  "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl",
  "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır",
  "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun",
  "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş",
  "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli",
  "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
  "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van",
  "Yalova", "Yozgat", "Zonguldak",
];

const DEFAULT_IL_SIFRE = "genc2026"; // ilk kurulumdan sonra il başkanları değiştirmeli
const DEFAULT_ADMIN_SIFRE = "admin2026";

async function main() {
  const ilHash = await bcrypt.hash(DEFAULT_IL_SIFRE, 10);
  for (const ad of CITIES) {
    await prisma.il.upsert({
      where: { ad },
      update: {},
      create: { ad, sifreHash: ilHash },
    });
  }

  const adminHash = await bcrypt.hash(DEFAULT_ADMIN_SIFRE, 10);
  await prisma.admin.upsert({
    where: { kullaniciAdi: "genelmerkez" },
    update: {},
    create: { kullaniciAdi: "genelmerkez", sifreHash: adminHash },
  });

  console.log(`${CITIES.length} il hesabı oluşturuldu. Varsayılan şifre: ${DEFAULT_IL_SIFRE}`);
  console.log(`Admin hesabı: genelmerkez / ${DEFAULT_ADMIN_SIFRE}`);
  console.log("ÖNEMLİ: Bu şifreleri canlıya almadan önce mutlaka değiştirin.");
}

main().finally(() => prisma.$disconnect());