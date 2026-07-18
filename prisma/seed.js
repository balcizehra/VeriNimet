const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CITIES = [
  { kod: "001", ad: "Adana" },
  { kod: "006", ad: "Ankara" },
  { kod: "007", ad: "Antalya" },
  { kod: "016", ad: "Bursa" },
  { kod: "021", ad: "Diyarbakır" },
  { kod: "025", ad: "Erzurum" },
  { kod: "027", ad: "Gaziantep" },
  { kod: "034", ad: "İstanbul" },
  { kod: "035", ad: "İzmir" },
  { kod: "038", ad: "Kayseri" },
  { kod: "041", ad: "Kocaeli" },
  { kod: "042", ad: "Konya" },
  { kod: "044", ad: "Malatya" },
  { kod: "033", ad: "Mersin" },
  { kod: "055", ad: "Samsun" },
  { kod: "063", ad: "Şanlıurfa" },
  { kod: "061", ad: "Trabzon" },
  { kod: "065", ad: "Van" }
];

const DEFAULT_IL_SIFRE = "genc2026"; 
const DEFAULT_ADMIN_SIFRE = "admin2026";

async function main() {
  const ilHash = await bcrypt.hash(DEFAULT_IL_SIFRE, 10);
  
  for (const city of CITIES) {
    await prisma.il.upsert({
      where: { ad: city.ad },
      update: { kod: city.kod }, 
      create: { 
        kod: city.kod, 
        ad: city.ad, 
        sifreHash: ilHash 
      },
    });
  }

  const adminHash = await bcrypt.hash(DEFAULT_ADMIN_SIFRE, 10);
  await prisma.admin.upsert({
    where: { kullaniciAdi: "genelmerkez" },
    update: {},
    create: { 
      kullaniciAdi: "genelmerkez", 
      sifreHash: adminHash 
    },
  });

  // Sistem Ayarı tablosu
  await prisma.sistemAyari.upsert({
    where: { anahtar: "gecen_hafta_izni" },
    update: {},
    create: { anahtar: "gecen_hafta_izni", degerBool: false },
  });

  console.log(`\n✅ ${CITIES.length} il hesabı başarıyla yüklendi/güncellendi!`);
  console.log(`👑 Genel Merkez Giriş ID: "genelmerkez" | Şifre: ${DEFAULT_ADMIN_SIFRE}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  