import { apiFetch, ApiError } from "./api-client";

export type RiwayatLahir = "normal" | "prematur" | "berat_lahir_rendah";
export type StatusYaTidak = "ya" | "tidak";
export type Sanitasi = "baik" | "kurang_baik";
export type PendapatanKeluarga = "rendah" | "cukup" | "tinggi";

export type FaktorRisiko = {
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
