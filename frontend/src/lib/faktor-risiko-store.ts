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

const STORAGE_KEY = "periang:faktor-risiko";
const EMPTY: FaktorRisiko[] = [];

function bacaSemua(): FaktorRisiko[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FaktorRisiko[]) : [];
  } catch {
    return [];
  }
}

function tulisSemua(data: FaktorRisiko[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const listeners = new Set<() => void>();
let cache: FaktorRisiko[] = bacaSemua();

function segarkanCache() {
  cache = bacaSemua();
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
  return bacaSemua().find((f) => f.balitaId === balitaId) ?? null;
}

export function simpanFaktorRisiko(
  data: Omit<FaktorRisiko, "updatedAt">,
): FaktorRisiko {
  const baru: FaktorRisiko = { ...data, updatedAt: new Date().toISOString() };
  const semua = bacaSemua().filter((f) => f.balitaId !== data.balitaId);
  semua.push(baru);
  tulisSemua(semua);
  segarkanCache();
  return baru;
}
