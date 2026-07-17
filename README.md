# Genç İHH — Raporlama Sistemi

İl başkanlarının haftalık saha verilerini girdiği, genel merkezin il+birim
bazında canlı gördüğü tam bağlantılı web uygulaması (Next.js + Prisma).

## Nasıl çalışıyor

- **İl girişi** (`/rapor`): İl adı + şifre ile giriş yapılır (kurumsal hesap,
  kişisel değil — başkan değişse de veri/hesap kalır). Birim(ler) seçilir,
  sihirbaz akışıyla toplantı/ders verileri girilir, "Gönder" ile veritabanına
  yazılır.
- **Admin girişi** (`/admin`): Genel merkez kullanıcı adı + şifre ile giriş
  yapar. İl + birim (+ istersen geçmiş hafta) seçer, o haftaya ait toplantı
  ve ders verilerini lokasyon lokasyon ve toplam olarak görür.
- İkisi **aynı veritabanına** yazıp okuduğu için form gönderildiği an admin
  panelinde görünür.

## Yerelde çalıştırma (5 dakika)

```bash
npm install
cp .env.example .env
npx prisma db push      # SQLite veritabanını oluşturur
npm run db:seed         # örnek il hesapları + admin hesabı oluşturur
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine git.

- İl girişi: **İl adı** = `Konya` (veya listede olan bir başka il),
  **Şifre** = `genc2026`
- Admin girişi: **Kullanıcı adı** = `genelmerkez`, **Şifre** = `admin2026`

Bu varsayılan şifreler `prisma/seed.js` içinde tanımlı — canlıya almadan
önce mutlaka değiştir.

## Canlıya alma (Vercel + ücretsiz Postgres)

Bu proje dosya tabanlı SQLite ile yerelde çalışır, ama Vercel gibi
sunucusuz ortamlarda dosya sistemi kalıcı olmadığı için canlıda **Postgres**
kullanman gerekir. Önerilen ücretsiz yol:

1. **Veritabanı**: [neon.tech](https://neon.tech) veya
   [supabase.com](https://supabase.com) üzerinde ücretsiz bir Postgres
   veritabanı oluştur, bağlantı string'ini (`postgresql://...`) kopyala.
2. `prisma/schema.prisma` içinde `provider = "sqlite"` satırını
   `provider = "postgresql"` yap.
3. **Hosting**: Bu klasörü bir GitHub reposuna yükle, [vercel.com](https://vercel.com)
   üzerinde "Import Project" ile bağla.
4. Vercel proje ayarlarında Environment Variables kısmına ekle:
   - `DATABASE_URL` → Postgres bağlantı string'in
   - `SESSION_SECRET` → `openssl rand -base64 32` ile ürettiğin rastgele metin
5. İlk deploy sonrası, veritabanı şemasını ve tohum verisini bir kere
   uzaktan çalıştırman gerekir:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   DATABASE_URL="postgresql://..." npm run db:seed
   ```
   (Bunu kendi bilgisayarından, `.env` dosyasına canlı `DATABASE_URL`'i
   geçici olarak yazarak da çalıştırabilirsin.)
6. Vercel deploy linkine gir, `/login` üzerinden test et.

Bundan sonra her `git push` otomatik olarak canlıya yansır.

## Şifreleri değiştirme / il ekleme

Şu an il hesapları ve admin hesabı `prisma/seed.js` üzerinden oluşuyor.
Gerçek kullanımda:
- Yeni il eklemek için Prisma Studio'yu aç: `npx prisma studio` → `Il`
  tablosuna yeni satır ekle (şifre hash'i gerekiyor, bcrypt ile üretilmeli).
- İleride bunu admin panelinden "il ekle / şifre sıfırla" ekranı olarak
  yapmanı öneririm — istersen bunu da ekleyebilirim.

## Üniversite / okul listelerini güncelleme

`components/data.js` içindeki `UNI_BY_CITY` objesi, il başkanı formunda
üniversite seçim listesini besliyor. Şu an sadece birkaç örnek il dolu;
gerçek kullanım için tüm illerin üniversite listesini buraya eklemen ya da
(daha esnek olması için) bunu da veritabanına taşımamı istersen söyle.

## Veri modeli özeti

Her **il + birim + hafta** kombinasyonu tek bir `Rapor` kaydı. Aynı hafta
içinde tekrar gönderim yapılırsa üzerine yazılır (kayıp veri, çift kayıt
olmaz). Her `Rapor`un altında birden çok `Lokasyon` (üniversite/okul adı,
türü, katılımcı sayısı) bulunur — admin panelindeki lokasyon bazlı liste ve
toplamlar buradan hesaplanır.

## Güvenlik notları (canlıya almadan önce)

- Seed'deki varsayılan şifreleri değiştir.
- `SESSION_SECRET`'i mutlaka rastgele ve gizli tut.
- İl hesapları kurumsal ve paylaşılan şifreli olduğu için, hassasiyet
  gerektiren bir kurulumda ileride "her il başkanına ayrı kullanıcı adı"
  modeline geçmek istersen şema buna kolayca genişletilebilir.
