import {
  apiFetch,
  ApiError,
  clearToken,
  EVENT_TIDAK_SAH,
  getToken,
  setToken,
} from "./api-client";
import { hapusKaderLokal, simpanKaderDariLogin } from "./kader-store";

const listeners = new Set<() => void>();
let cache = getToken() !== null;

function segarkanCache() {
  cache = getToken() !== null;
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  // Token ditolak server (kedaluwarsa/dicabut) → sinkronkan status login lokal.
  window.addEventListener(EVENT_TIDAK_SAH, () => {
    hapusKaderLokal();
    segarkanCache();
  });
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

type LoginResponse = {
  user: { id: number; name: string; email: string; posyandu: string };
  token: string;
};

export async function masuk(
  email: string,
  kataSandi: string,
): Promise<{ berhasil: true } | { berhasil: false; pesan: string }> {
  try {
    const data = await apiFetch<LoginResponse>("/login", {
      method: "POST",
      body: { email, password: kataSandi },
    });

    setToken(data.token);
    simpanKaderDariLogin(data.user);
    segarkanCache();
    return { berhasil: true };
  } catch (error) {
    const pesan =
      error instanceof ApiError
        ? error.message
        : "Tidak bisa terhubung ke server.";
    return { berhasil: false, pesan };
  }
}

export async function keluar() {
  try {
    await apiFetch("/logout", { method: "POST" });
  } catch {
    // Token mungkin sudah kedaluwarsa/tidak valid; tetap hapus sesi lokal.
  }

  clearToken();
  hapusKaderLokal();
  segarkanCache();
}

export async function gantiKataSandi(
  kataSandiLama: string,
  kataSandiBaru: string,
): Promise<{ berhasil: true } | { berhasil: false; pesan: string }> {
  try {
    await apiFetch("/profil/kata-sandi", {
      method: "PUT",
      body: {
        kata_sandi_lama: kataSandiLama,
        kata_sandi_baru: kataSandiBaru,
        kata_sandi_baru_confirmation: kataSandiBaru,
      },
    });
    return { berhasil: true };
  } catch (error) {
    const pesan =
      error instanceof ApiError
        ? error.message
        : "Tidak bisa terhubung ke server.";
    return { berhasil: false, pesan };
  }
}

export async function lupaKataSandi(
  email: string,
): Promise<
  { berhasil: true; pesan: string } | { berhasil: false; pesan: string }
> {
  try {
    const data = await apiFetch<{ message: string }>("/lupa-kata-sandi", {
      method: "POST",
      body: { email },
    });
    return { berhasil: true, pesan: data.message };
  } catch (error) {
    const pesan =
      error instanceof ApiError
        ? error.message
        : "Tidak bisa terhubung ke server.";
    return { berhasil: false, pesan };
  }
}

/**
 * Reset kata sandi dari tautan "lupa kata sandi" (token dari email, tanpa
 * perlu kata sandi lama).
 */
export async function resetKataSandi(
  token: string,
  email: string,
  kataSandiBaru: string,
): Promise<{ berhasil: true } | { berhasil: false; pesan: string }> {
  try {
    await apiFetch("/reset-kata-sandi", {
      method: "POST",
      body: {
        token,
        email,
        kata_sandi_baru: kataSandiBaru,
        kata_sandi_baru_confirmation: kataSandiBaru,
      },
    });
    return { berhasil: true };
  } catch (error) {
    const pesan =
      error instanceof ApiError
        ? error.message
        : "Tidak bisa terhubung ke server.";
    return { berhasil: false, pesan };
  }
}
