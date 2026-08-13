import { StatusGizi } from "./dummy-data";

export type RiwayatCek = {
  id: string;
  balitaId: string;
  tanggalCek: string;
  umurBulan: number;
  beratKg: number;
  tinggiCm: number;
  status: StatusGizi;
  createdAt: string;
};

const STORAGE_KEY = "periang:riwayat-cek";
const EMPTY: RiwayatCek[] = [];

function bacaSemua(): RiwayatCek[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RiwayatCek[]) : [];
  } catch {
    return [];
  }
}

function tulisSemua(data: RiwayatCek[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const listeners = new Set<() => void>();
let cache: RiwayatCek[] = bacaSemua().sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);

function segarkanCache() {
  cache = bacaSemua().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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

export function simpanRiwayatCek(
  entry: Omit<RiwayatCek, "id" | "createdAt">,
): RiwayatCek {
  const baru: RiwayatCek = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const semua = bacaSemua();
  semua.unshift(baru);
  tulisSemua(semua);
  segarkanCache();
  return baru;
}

export function getRiwayatByBalita(balitaId: string): RiwayatCek[] {
  return bacaSemua()
    .filter((r) => r.balitaId === balitaId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function hapusRiwayatCek(id: string): void {
  tulisSemua(bacaSemua().filter((r) => r.id !== id));
  segarkanCache();
}
