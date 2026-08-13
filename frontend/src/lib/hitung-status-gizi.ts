import { StatusGizi } from "./dummy-data";

export type AnalisisGizi = {
  status: StatusGizi;
  beratKg: number;
  tinggiCm: number;
  beratIdealKg: number;
  tinggiIdealCm: number;
  rasioBerat: number;
  rasioTinggi: number;
};

/**
 * Placeholder: perhitungan sederhana sebagai pengganti tabel standar WHO/KMS.
 * Akan diganti perhitungan resmi berbasis z-score saat backend tersedia.
 */
export function analisisStatusGizi(
  umurBulan: number,
  beratKg: number,
  tinggiCm: number,
): AnalisisGizi {
  const beratIdealKg = 3 + umurBulan * 0.4;
  const tinggiIdealCm = 50 + umurBulan * 1.5;

  const rasioBerat = beratKg / beratIdealKg;
  const rasioTinggi = tinggiCm / tinggiIdealCm;

  let status: StatusGizi = "normal";
  if (rasioBerat < 0.7) status = "buruk";
  else if (rasioTinggi < 0.85) status = "pendek";
  else if (rasioBerat < 0.85) status = "kurang";

  return {
    status,
    beratKg,
    tinggiCm,
    beratIdealKg,
    tinggiIdealCm,
    rasioBerat,
    rasioTinggi,
  };
}
