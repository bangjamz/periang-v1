import { apiFetch, ApiError } from "./api-client";
import { FaktorRisiko } from "./faktor-risiko-store";
import { StatusGizi } from "./dummy-data";

export type TingkatRisiko = "rendah" | "sedang" | "tinggi";

export type HasilPrediksi = {
  skor: number;
  skorMaksimal: number;
  tingkatRisiko: TingkatRisiko;
  faktorKontribusi: string[];
  rekomendasiUmum: string;
  rekomendasi: string[];
};

const SKOR_MAKSIMAL = 11;

/**
 * Rekomendasi tindakan umum menurut tingkat risiko keseluruhan, ditampilkan
 * di atas rekomendasi per-faktor.
 */
const REKOMENDASI_UMUM: Record<TingkatRisiko, string> = {
  rendah:
    "Risiko rendah. Lanjutkan pemeriksaan rutin bulanan ke posyandu untuk memantau tumbuh kembang balita.",
  sedang:
    "Risiko sedang. Tingkatkan frekuensi pemantauan dan segera perbaiki faktor risiko yang teridentifikasi.",
  tinggi:
    "Risiko tinggi. Segera rujuk balita ke tenaga kesehatan (Puskesmas/dokter) untuk pemeriksaan dan penanganan lebih lanjut.",
};

/**
 * Placeholder: skor risiko sederhana berbasis bobot per faktor, sebagai
 * pengganti model AI (InsForge/OpenRouter) yang akan dipanggil backend nanti.
 */
export function hitungPrediksiRisiko(
  faktor: Pick<
    FaktorRisiko,
    | "riwayatLahir"
    | "imunisasi"
    | "asiEksklusif"
    | "sanitasi"
    | "pendapatanKeluarga"
  >,
  statusGiziTerakhir: StatusGizi | null,
): HasilPrediksi {
  let skor = 0;
  const faktorKontribusi: string[] = [];
  const rekomendasi: string[] = [];

  if (faktor.riwayatLahir === "prematur") {
    skor += 2;
    faktorKontribusi.push("Riwayat lahir prematur");
  } else if (faktor.riwayatLahir === "berat_lahir_rendah") {
    skor += 2;
    faktorKontribusi.push("Riwayat berat lahir rendah");
  }

  if (faktor.imunisasi === "tidak") {
    skor += 2;
    faktorKontribusi.push("Imunisasi belum lengkap");
    rekomendasi.push("Lengkapi imunisasi dasar sesuai jadwal di posyandu.");
  }

  if (faktor.asiEksklusif === "tidak") {
    skor += 1;
    faktorKontribusi.push("Tidak mendapat ASI eksklusif");
    rekomendasi.push(
      "Konsultasikan pemberian ASI/nutrisi tambahan ke tenaga kesehatan.",
    );
  }

  if (faktor.sanitasi === "kurang_baik") {
    skor += 2;
    faktorKontribusi.push("Sanitasi lingkungan kurang baik");
    rekomendasi.push("Tingkatkan akses air bersih dan sanitasi di rumah.");
  }

  if (faktor.pendapatanKeluarga === "rendah") {
    skor += 1;
    faktorKontribusi.push("Pendapatan keluarga rendah");
    rekomendasi.push(
      "Hubungkan keluarga dengan program bantuan gizi/sosial setempat.",
    );
  }

  if (statusGiziTerakhir === "buruk") {
    skor += 3;
    faktorKontribusi.push("Status gizi terakhir: gizi buruk");
    rekomendasi.push("Segera rujuk ke Puskesmas/tenaga kesehatan.");
  } else if (statusGiziTerakhir === "kurang") {
    skor += 2;
    faktorKontribusi.push("Status gizi terakhir: gizi kurang");
    rekomendasi.push("Pantau berat badan lebih rutin tiap bulan.");
  } else if (statusGiziTerakhir === "pendek") {
    skor += 2;
    faktorKontribusi.push("Status gizi terakhir: stunting (pendek)");
    rekomendasi.push("Konsultasikan risiko stunting ke tenaga kesehatan.");
  }

  let tingkatRisiko: TingkatRisiko = "rendah";
  if (skor >= 7) tingkatRisiko = "tinggi";
  else if (skor >= 3) tingkatRisiko = "sedang";

  if (rekomendasi.length === 0) {
    rekomendasi.push(
      "Pertahankan pola asuh dan pemeriksaan rutin ke posyandu.",
    );
  }

  return {
    skor,
    skorMaksimal: SKOR_MAKSIMAL,
    tingkatRisiko,
    faktorKontribusi,
    rekomendasiUmum: REKOMENDASI_UMUM[tingkatRisiko],
    rekomendasi,
  };
}

type PrediksiRisikoApi = {
  skor: number;
  skor_maksimal: number;
  tingkat_risiko: TingkatRisiko;
  faktor_kontribusi: string[];
  rekomendasi_umum: string;
  rekomendasi: string[];
};

/**
 * Ambil hasil prediksi risiko dari server (dihitung backend dari faktor
 * risiko & status gizi terakhir balita — lihat PrediksiRisikoService).
 */
export async function ambilPrediksiRisiko(
  balitaId: string,
): Promise<
  { berhasil: true; hasil: HasilPrediksi } | { berhasil: false; pesan: string }
> {
  try {
    const res = await apiFetch<PrediksiRisikoApi>(
      `/balita/${balitaId}/prediksi`,
    );
    return {
      berhasil: true,
      hasil: {
        skor: res.skor,
        skorMaksimal: res.skor_maksimal,
        tingkatRisiko: res.tingkat_risiko,
        faktorKontribusi: res.faktor_kontribusi,
        rekomendasiUmum: res.rekomendasi_umum,
        rekomendasi: res.rekomendasi,
      },
    };
  } catch (error) {
    const pesan =
      error instanceof ApiError
        ? error.message
        : "Tidak bisa terhubung ke server.";
    return { berhasil: false, pesan };
  }
}
