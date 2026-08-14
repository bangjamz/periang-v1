import { DUMMY_KADER } from "./kader-data";

const STORAGE_KEY = "periang:auth";
const STORAGE_KEY_KATA_SANDI = "periang:kata-sandi";

// Kredensial tiruan; belum tersambung ke backend (Sanctum) — menyusul saat wiring API.
const KATA_SANDI_AWAL = "posyandu123";

function bacaStatus(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function bacaKataSandi(): string {
  if (typeof window === "undefined") return KATA_SANDI_AWAL;
  return window.localStorage.getItem(STORAGE_KEY_KATA_SANDI) ?? KATA_SANDI_AWAL;
}

const listeners = new Set<() => void>();
let cache = bacaStatus();

function segarkanCache() {
  cache = bacaStatus();
  listeners.forEach((listener) => listener());
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthSnapshot(): boolean {
  return cache;
}

export function getAuthServerSnapshot(): boolean {
  return false;
}

export function masuk(
  email: string,
  kataSandi: string,
): { berhasil: true } | { berhasil: false; pesan: string } {
  if (email.trim().toLowerCase() !== DUMMY_KADER.email.toLowerCase()) {
    return { berhasil: false, pesan: "Email atau kata sandi salah." };
  }
  if (kataSandi !== bacaKataSandi()) {
    return { berhasil: false, pesan: "Email atau kata sandi salah." };
  }

  window.localStorage.setItem(STORAGE_KEY, "1");
  segarkanCache();
  return { berhasil: true };
}

export function keluar() {
  window.localStorage.removeItem(STORAGE_KEY);
  segarkanCache();
}

export function gantiKataSandi(
  kataSandiLama: string,
  kataSandiBaru: string,
): { berhasil: true } | { berhasil: false; pesan: string } {
  if (kataSandiLama !== bacaKataSandi()) {
    return { berhasil: false, pesan: "Kata sandi saat ini salah." };
  }

  window.localStorage.setItem(STORAGE_KEY_KATA_SANDI, kataSandiBaru);
  return { berhasil: true };
}

/**
 * Reset kata sandi dari tautan "lupa kata sandi" (tanpa perlu kata sandi
 * lama). Token belum diverifikasi ke backend — tiruan untuk alur frontend.
 */
export function resetKataSandi(kataSandiBaru: string) {
  window.localStorage.setItem(STORAGE_KEY_KATA_SANDI, kataSandiBaru);
}
