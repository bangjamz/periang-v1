import { apiFetch, ApiError } from "./api-client";
import { DUMMY_KADER, type Kader } from "./kader-data";

const STORAGE_KEY = "periang:kader";

function hitungInisial(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  const inisial = kata
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
  return inisial || "?";
}

function bacaKader(): Kader {
  if (typeof window === "undefined") return DUMMY_KADER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Kader) : DUMMY_KADER;
  } catch {
    return DUMMY_KADER;
  }
}

function tulisKader(data: Kader) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const listeners = new Set<() => void>();
let cache: Kader = bacaKader();

function segarkanCache() {
  cache = bacaKader();
  listeners.forEach((listener) => listener());
}

export function subscribeKader(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getKaderSnapshot(): Kader {
  return cache;
}

export function getKaderServerSnapshot(): Kader {
  return DUMMY_KADER;
}

type KaderApi = { name: string; email: string; posyandu: string };

function simpanDariApi(user: KaderApi): Kader {
  const baru: Kader = {
    nama: user.name,
    email: user.email,
    posyandu: user.posyandu,
    inisial: hitungInisial(user.name),
  };
  tulisKader(baru);
  segarkanCache();
  return baru;
}

/** Dipanggil setelah login berhasil, memakai data user dari respons login. */
export function simpanKaderDariLogin(user: KaderApi): Kader {
  return simpanDariApi(user);
}

/** Bersihkan cache kader lokal saat keluar (logout). */
export function hapusKaderLokal() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  segarkanCache();
}

/** Ambil ulang profil kader terkini dari server (mis. saat aplikasi dibuka). */
export async function muatKader(): Promise<void> {
  try {
    const user = await apiFetch<KaderApi>("/profil");
    simpanDariApi(user);
  } catch {
    // Biarkan cache lokal (localStorage) apa adanya kalau gagal memuat.
  }
}

export async function perbaruiKader(data: {
  nama: string;
  posyandu: string;
}): Promise<{ berhasil: true } | { berhasil: false; pesan: string }> {
  try {
    const user = await apiFetch<KaderApi>("/profil", {
      method: "PUT",
      body: { name: data.nama, posyandu: data.posyandu },
    });
    simpanDariApi(user);
    return { berhasil: true };
  } catch (error) {
    const pesan =
      error instanceof ApiError
        ? error.message
        : "Tidak bisa terhubung ke server.";
    return { berhasil: false, pesan };
  }
}
