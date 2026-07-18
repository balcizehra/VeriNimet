-- CreateTable
CREATE TABLE "Il" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sifreHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kullaniciAdi" TEXT NOT NULL,
    "sifreHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Rapor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "il" TEXT NOT NULL,
    "birim" TEXT NOT NULL,
    "hafta" TEXT NOT NULL,
    "toplantiYapildi" BOOLEAN NOT NULL,
    "dersYapildi" BOOLEAN NOT NULL,
    "guncellenmeTarihi" DATETIME NOT NULL,
    "olusturmaTarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lokasyon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "raporId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "tur" TEXT,
    "katilim" INTEGER NOT NULL,
    CONSTRAINT "Lokasyon_raporId_fkey" FOREIGN KEY ("raporId") REFERENCES "Rapor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SistemAyari" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "anahtar" TEXT NOT NULL,
    "degerBool" BOOLEAN NOT NULL DEFAULT false,
    "guncellenmeTarihi" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Il_kod_key" ON "Il"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Il_ad_key" ON "Il"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_kullaniciAdi_key" ON "Admin"("kullaniciAdi");

-- CreateIndex
CREATE INDEX "Rapor_il_birim_idx" ON "Rapor"("il", "birim");

-- CreateIndex
CREATE UNIQUE INDEX "Rapor_il_birim_hafta_key" ON "Rapor"("il", "birim", "hafta");

-- CreateIndex
CREATE UNIQUE INDEX "SistemAyari_anahtar_key" ON "SistemAyari"("anahtar");
