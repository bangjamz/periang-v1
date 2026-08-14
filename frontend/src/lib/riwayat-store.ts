import { apiFetch, ApiError } from "./api-client";
import { StatusGizi } from "./dummy-data";

export type RiwayatCek = {
  id: string;
  balitaId: string;
  tanggalCek: string;
  umurBulan: number;
  beratKg: number;
  tinggiCm: number;
  status: StatusGizi;
  catatan?: string;
  createdAt: string;
};

export type HasilPemeriksaan = RiwayatCek & {
  beratMedianKg: number;
  tinggiMedianCm: number;
  rasioBerat: number;
  rasioTinggi: number;
};

const EMPTY: RiwayatCek[] = [];

type PemeriksaanApi = {
  id: number;
  balita_id: number;
  umur_bulan: number;
  berat_kg: string | number;
  tinggi_cm: string | number;
  status_gizi: StatusGizi;
  catatan: string | null;
  tanggal_cek: string;
  created_at: string;
};

function dariApi(row: PemeriksaanApi): RiwayatCek {
  return {
    id: String(row.id),
    balitaId: String(row.balita_id),
    // Laravel serialize cast 'date' sebagai ISO datetime penuh; potong ke YYYY-MM-DD.
    tanggalCek: row.tanggal_cek.slice(0, 10),
    umurBulan: row.umur_bulan,
    beratKg: Number(row.berat_kg),
    tinggiCm: Number(row.tinggi_cm),
    status: row.status_gizi,
    catatan: row.catatan ?? undefined,
    createdAt: row.created_at,
  };
}

type HasilAksi = { berhasil: true } | { berhasil: false; pesan: string };

function pesanError(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Tidak bisa terhubung ke server.";
}

const listeners = new Set<() => void>();
let cache: RiwayatCek[] = EMPTY;
let memuat = true;

function segarkanCache(baru: RiwayatCek[]) {
  cache = [...baru].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  listeners.forEach((listener) => listener());
}

export function subscribeRiwayat(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRiwayatSnapshot(): RiwayatCek[] {
  return cache;
}

export function getRiwayatServerSnapshot(): RiwayatCek[] {
  return EMPTY;
}

export function isRiwayatMemuat(): boolean {
  return memuat;
}

/** Ambil ulang seluruh riwayat pemeriksaan dari server. */
export async function muatRiwayat(): Promise<void> {
  try {
    const rows = await apiFetch<PemeriksaanApi[]>("/pemeriksaan");
    cache = [...rows.map(dariApi)].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  } catch {
    // Biarkan cache lokal apa adanya kalau gagal memuat.
  } finally {
    memuat = false;
    listeners.forEach((listener) => listener());
  }
}

export function getRiwayatByBalita(balitaId: string): RiwayatCek[] {
  return cache.filter((r) => r.balitaId === balitaId);
}

export function getRiwayatById(id: string): RiwayatCek | null {
  return cache.find((r) => r.id === id) ?? null;
}

type DataPemeriksaan = {
  tanggalCek: string;
  beratKg: number;
  tinggiCm: number;
  catatan?: string;
};

/** Hitung status gizi (server, Gomez/Waterlow) & simpan sekaligus ke riwayat. */
export async function simpanRiwayatCek(
  entry: DataPemeriksaan & { balitaId: string },
): Promise<
  | { berhasil: true; hasil: HasilPemeriksaan }
  | { berhasil: false; pesan: string }
> {
  try {
    const res = await apiFetch<{
      pemeriksaan: PemeriksaanApi;
      berat_median_kg: number;
      tinggi_median_cm: number;
      rasio_berat: number;
      rasio_tinggi: number;
    }>("/pemeriksaan", {
      method: "POST",
      body: {
        balita_id: Number(entry.balitaId),
        tanggal_cek: entry.tanggalCek,
        berat_kg: entry.beratKg,
        tinggi_cm: entry.tinggiCm,
        catatan: entry.catatan,
      },
    });

    const riwayat = dariApi(res.pemeriksaan);
    segarkanCache([riwayat, ...cache.filter((r) => r.id !== riwayat.id)]);

    return {
      berhasil: true,
      hasil: {
        ...riwayat,
        beratMedianKg: res.berat_median_kg,
        tinggiMedianCm: res.tinggi_median_cm,
        rasioBerat: res.rasio_berat,
        rasioTinggi: res.rasio_tinggi,
      },
    };
  } catch (error) {
    return { berhasil: false, pesan: pesanError(error) };
  }
}

export async function perbaruiRiwayatCek(
  id: string,
  data: DataPemeriksaan,
): Promise<HasilAksi> {
  try {
    const res = await apiFetch<{ pemeriksaan: PemeriksaanApi }>(
      `/pemeriksaan/${id}`,
      {
        method: "PUT",
        body: {
          tanggal_cek: data.tanggalCek,
          berat_kg: data.beratKg,
          tinggi_cm: data.tinggiCm,
          catatan: data.catatan,
        },
      },
    );

    const riwayat = dariApi(res.pemeriksaan);
    segarkanCache(cache.map((r) => (r.id === id ? riwayat : r)));
    return { berhasil: true };
  } catch (error) {
    return { berhasil: false, pesan: pesanError(error) };
  }
}

export async function hapusRiwayatCek(id: string): Promise<HasilAksi> {
  try {
    await apiFetch(`/pemeriksaan/${id}`, { method: "DELETE" });
    segarkanCache(cache.filter((r) => r.id !== id));
    return { berhasil: true };
  } catch (error) {
    return { berhasil: false, pesan: pesanError(error) };
  }
}

/**
 * Hapus riwayat balita ini dari cache lokal saja (tanpa panggil API) —
 * dipakai setelah hapus balita, karena server sudah cascade-hapus
 * riwayatnya lewat foreign key.
 */
export function hapusRiwayatByBalitaLokal(balitaId: string) {
  segarkanCache(cache.filter((r) => r.balitaId !== balitaId));
}
