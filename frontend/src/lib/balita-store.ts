import { apiFetch, ApiError } from "./api-client";
import { Balita, JenisKelamin } from "./dummy-data";

const EMPTY: Balita[] = [];

type BalitaApi = {
  id: number;
  nama: string;
  jenis_kelamin: JenisKelamin;
  tanggal_lahir: string;
  posyandu: string;
  berat_lahir: string | number | null;
  tinggi_lahir: string | number | null;
  alamat: string | null;
};

function dariApi(row: BalitaApi): Balita {
  return {
    id: String(row.id),
    nama: row.nama,
    jenisKelamin: row.jenis_kelamin,
    // Laravel serialize cast 'date' sebagai ISO datetime penuh; potong ke YYYY-MM-DD.
    tanggalLahir: row.tanggal_lahir.slice(0, 10),
    posyandu: row.posyandu,
    beratLahirKg: row.berat_lahir != null ? Number(row.berat_lahir) : undefined,
    tinggiLahirCm:
      row.tinggi_lahir != null ? Number(row.tinggi_lahir) : undefined,
    alamat: row.alamat ?? undefined,
  };
}

function keApi(data: Omit<Balita, "id">) {
  return {
    nama: data.nama,
    jenis_kelamin: data.jenisKelamin,
    tanggal_lahir: data.tanggalLahir,
    posyandu: data.posyandu,
    berat_lahir: data.beratLahirKg ?? null,
    tinggi_lahir: data.tinggiLahirCm ?? null,
    alamat: data.alamat ?? null,
  };
}

type HasilAksi = { berhasil: true } | { berhasil: false; pesan: string };

function pesanError(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Tidak bisa terhubung ke server.";
}

const listeners = new Set<() => void>();
let cache: Balita[] = EMPTY;
let memuat = true;

function segarkanCache(baru: Balita[]) {
  cache = baru;
  listeners.forEach((listener) => listener());
}

export function subscribeBalita(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBalitaSnapshot(): Balita[] {
  return cache;
}

export function getBalitaServerSnapshot(): Balita[] {
  return EMPTY;
}

export function isBalitaMemuat(): boolean {
  return memuat;
}

/** Ambil ulang daftar balita dari server (dipanggil sekali saat aplikasi dibuka). */
export async function muatBalita(): Promise<void> {
  try {
    const rows = await apiFetch<BalitaApi[]>("/balita");
    cache = rows.map(dariApi);
  } catch {
    // Biarkan cache lokal apa adanya kalau gagal memuat.
  } finally {
    memuat = false;
    listeners.forEach((listener) => listener());
  }
}

export async function tambahBalita(
  data: Omit<Balita, "id">,
): Promise<
  { berhasil: true; balita: Balita } | { berhasil: false; pesan: string }
> {
  try {
    const row = await apiFetch<BalitaApi>("/balita", {
      method: "POST",
      body: keApi(data),
    });
    const baru = dariApi(row);
    segarkanCache([...cache, baru]);
    return { berhasil: true, balita: baru };
  } catch (error) {
    return { berhasil: false, pesan: pesanError(error) };
  }
}

export async function perbaruiBalita(
  id: string,
  data: Omit<Balita, "id">,
): Promise<HasilAksi> {
  try {
    const row = await apiFetch<BalitaApi>(`/balita/${id}`, {
      method: "PUT",
      body: keApi(data),
    });
    const baru = dariApi(row);
    segarkanCache(cache.map((b) => (b.id === id ? baru : b)));
    return { berhasil: true };
  } catch (error) {
    return { berhasil: false, pesan: pesanError(error) };
  }
}

export async function hapusBalita(id: string): Promise<HasilAksi> {
  try {
    await apiFetch(`/balita/${id}`, { method: "DELETE" });
    segarkanCache(cache.filter((b) => b.id !== id));
    return { berhasil: true };
  } catch (error) {
    return { berhasil: false, pesan: pesanError(error) };
  }
}
