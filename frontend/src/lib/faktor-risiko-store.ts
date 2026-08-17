import { apiFetch, ApiError } from "./api-client";

export type RiwayatLahir = "normal" | "prematur" | "berat_lahir_rendah";
export type StatusYaTidak = "ya" | "tidak";
export type Sanitasi = "baik" | "kurang_baik";
export type PendapatanKeluarga = "rendah" | "cukup" | "tinggi";

/**
 * 16 field granular yang dipakai langsung sebagai fitur champion model ML
 * (lihat docs/champion-model-integration.md di root repo). Semua opsional —
 * boleh diisi bertahap, field kosong diimputasi microservice ML.
 */
export type FaktorRisikoModel = {
  jumlahArt?: number;
  jumlahBalitaRt?: number;
  pekerjaanAyah?: number;
  pekerjaanIbu?: number;
  pendidikanAyah?: number;
  pendidikanIbu?: number;
  kepemilikanJamban?: number;
  lokasiAirMinum?: number;
  pembuanganLimbahCair?: number;
  pembuanganTinja?: number;
  sumberAirMinum?: number;
  usiaKandunganMinggu?: number;
  kepemilikanBukuKia?: number;
  imunisasiHb0?: number;
  imunisasiBcg?: number;
  imunisasiDptHbHibLanjutan?: number;
};

export type FaktorRisiko = FaktorRisikoModel & {
  balitaId: string;
  riwayatLahir: RiwayatLahir;
  imunisasi: StatusYaTidak;
  asiEksklusif: StatusYaTidak;
  sanitasi: Sanitasi;
  pendapatanKeluarga?: PendapatanKeluarga;
  updatedAt: string;
};

const EMPTY: FaktorRisiko[] = [];

type FaktorRisikoApi = {
  balita_id: number;
  riwayat_lahir: RiwayatLahir;
  imunisasi: StatusYaTidak;
  asi_eksklusif: StatusYaTidak;
  sanitasi: Sanitasi;
  pendapatan_keluarga: PendapatanKeluarga | null;
  jumlah_art: number | null;
  jumlah_balita_rt: number | null;
  pekerjaan_ayah: number | null;
  pekerjaan_ibu: number | null;
  pendidikan_ayah: number | null;
  pendidikan_ibu: number | null;
  kepemilikan_jamban: number | null;
  lokasi_air_minum: number | null;
  pembuangan_limbah_cair: number | null;
  pembuangan_tinja: number | null;
  sumber_air_minum: number | null;
  usia_kandungan_minggu: number | null;
  kepemilikan_buku_kia: number | null;
  imunisasi_hb0: number | null;
  imunisasi_bcg: number | null;
  imunisasi_dpt_hb_hib_lanjutan: number | null;
  updated_at: string;
};

function dariApi(row: FaktorRisikoApi): FaktorRisiko {
  return {
    balitaId: String(row.balita_id),
    riwayatLahir: row.riwayat_lahir,
    imunisasi: row.imunisasi,
    asiEksklusif: row.asi_eksklusif,
    sanitasi: row.sanitasi,
    pendapatanKeluarga: row.pendapatan_keluarga ?? undefined,
    jumlahArt: row.jumlah_art ?? undefined,
    jumlahBalitaRt: row.jumlah_balita_rt ?? undefined,
    pekerjaanAyah: row.pekerjaan_ayah ?? undefined,
    pekerjaanIbu: row.pekerjaan_ibu ?? undefined,
    pendidikanAyah: row.pendidikan_ayah ?? undefined,
    pendidikanIbu: row.pendidikan_ibu ?? undefined,
    kepemilikanJamban: row.kepemilikan_jamban ?? undefined,
    lokasiAirMinum: row.lokasi_air_minum ?? undefined,
    pembuanganLimbahCair: row.pembuangan_limbah_cair ?? undefined,
    pembuanganTinja: row.pembuangan_tinja ?? undefined,
    sumberAirMinum: row.sumber_air_minum ?? undefined,
    usiaKandunganMinggu: row.usia_kandungan_minggu ?? undefined,
    kepemilikanBukuKia: row.kepemilikan_buku_kia ?? undefined,
    imunisasiHb0: row.imunisasi_hb0 ?? undefined,
    imunisasiBcg: row.imunisasi_bcg ?? undefined,
    imunisasiDptHbHibLanjutan: row.imunisasi_dpt_hb_hib_lanjutan ?? undefined,
    updatedAt: row.updated_at,
  };
}

const listeners = new Set<() => void>();
let cache: FaktorRisiko[] = EMPTY;

function segarkanCache(baru: FaktorRisiko[]) {
  cache = baru;
  listeners.forEach((listener) => listener());
}

export function subscribeFaktorRisiko(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFaktorRisikoSnapshot(): FaktorRisiko[] {
  return cache;
}

export function getFaktorRisikoServerSnapshot(): FaktorRisiko[] {
  return EMPTY;
}

export function getFaktorRisikoByBalita(balitaId: string): FaktorRisiko | null {
  return cache.find((f) => f.balitaId === balitaId) ?? null;
}

/** Ambil faktor risiko balita dari server (belum diisi → dibiarkan, bukan error). */
export async function muatFaktorRisiko(balitaId: string): Promise<void> {
  try {
    const row = await apiFetch<FaktorRisikoApi>(
      `/balita/${balitaId}/faktor-risiko`,
    );
    const data = dariApi(row);
    segarkanCache([data, ...cache.filter((f) => f.balitaId !== balitaId)]);
  } catch {
    // Belum diisi atau gagal memuat; biarkan cache seperti semula.
  }
}

export async function simpanFaktorRisiko(
  data: Omit<FaktorRisiko, "updatedAt">,
): Promise<
  { berhasil: true; data: FaktorRisiko } | { berhasil: false; pesan: string }
> {
  try {
    const row = await apiFetch<FaktorRisikoApi>(
      `/balita/${data.balitaId}/faktor-risiko`,
      {
        method: "PUT",
        body: {
          riwayat_lahir: data.riwayatLahir,
          imunisasi: data.imunisasi,
          asi_eksklusif: data.asiEksklusif,
          sanitasi: data.sanitasi,
          pendapatan_keluarga: data.pendapatanKeluarga ?? null,
          jumlah_art: data.jumlahArt ?? null,
          jumlah_balita_rt: data.jumlahBalitaRt ?? null,
          pekerjaan_ayah: data.pekerjaanAyah ?? null,
          pekerjaan_ibu: data.pekerjaanIbu ?? null,
          pendidikan_ayah: data.pendidikanAyah ?? null,
          pendidikan_ibu: data.pendidikanIbu ?? null,
          kepemilikan_jamban: data.kepemilikanJamban ?? null,
          lokasi_air_minum: data.lokasiAirMinum ?? null,
          pembuangan_limbah_cair: data.pembuanganLimbahCair ?? null,
          pembuangan_tinja: data.pembuanganTinja ?? null,
          sumber_air_minum: data.sumberAirMinum ?? null,
          usia_kandungan_minggu: data.usiaKandunganMinggu ?? null,
          kepemilikan_buku_kia: data.kepemilikanBukuKia ?? null,
          imunisasi_hb0: data.imunisasiHb0 ?? null,
          imunisasi_bcg: data.imunisasiBcg ?? null,
          imunisasi_dpt_hb_hib_lanjutan: data.imunisasiDptHbHibLanjutan ?? null,
        },
      },
    );
    const baru = dariApi(row);
    segarkanCache([baru, ...cache.filter((f) => f.balitaId !== baru.balitaId)]);
    return { berhasil: true, data: baru };
  } catch (error) {
    const pesan =
      error instanceof ApiError
        ? error.message
        : "Tidak bisa terhubung ke server.";
    return { berhasil: false, pesan };
  }
}
