import { Building2, School, ClipboardList, Baby } from "lucide-react";

export const BIRIMLER = [
  { key: "universite", label: "Üniversite", icon: Building2 },
  { key: "lise", label: "Lise", icon: School },
  { key: "ortaokul", label: "Ortaokul", icon: ClipboardList },
  { key: "cocuk", label: "Çocuk", icon: Baby },
];

export const UNI_BY_CITY = {
  Ankara: ["Hacı Bayram Veli Üniversitesi", "Yıldırım Beyazıt Üniversitesi", "Ankara Üniversitesi", "Gazi Üniversitesi"],
  Konya: ["Selçuk Üniversitesi", "Necmettin Erbakan Üniversitesi", "KTO Karatay Üniversitesi"],
  Bursa: ["Uludağ Üniversitesi", "Bursa Teknik Üniversitesi", "Bursa Uludağ Tıp"],
  İstanbul: ["İstanbul Üniversitesi", "Marmara Üniversitesi", "Yıldız Teknik Üniversitesi", "İstanbul Medeniyet Üniversitesi"],
};
export function genericUni(city) {
  return UNI_BY_CITY[city] || ["Devlet Üniversitesi", "Vakıf Üniversitesi"];
}

export const OKUL_TUR = ["Fen Lisesi", "Anadolu Lisesi", "İmam Hatip Lisesi", "Sosyal Bilimler Lisesi", "Mesleki ve Teknik Lise", "Diğer"];
