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

export function perbaruiKader(data: { nama: string; posyandu: string }): Kader {
  const kaderSaatIni = bacaKader();
  const baru: Kader = {
    ...kaderSaatIni,
    nama: data.nama,
    posyandu: data.posyandu,
    inisial: hitungInisial(data.nama),
  };
  tulisKader(baru);
  segarkanCache();
  return baru;
}
