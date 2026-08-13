import { Balita, DUMMY_BALITA } from "./dummy-data";

const STORAGE_KEY = "periang:balita";

function bacaSemua(): Balita[] {
  if (typeof window === "undefined") return DUMMY_BALITA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Balita[]) : DUMMY_BALITA;
  } catch {
    return DUMMY_BALITA;
  }
}

function tulisSemua(data: Balita[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const listeners = new Set<() => void>();
let cache: Balita[] = bacaSemua();

function segarkanCache() {
  cache = bacaSemua();
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
  return DUMMY_BALITA;
}

export function tambahBalita(data: Omit<Balita, "id">): Balita {
  const baru: Balita = {
    ...data,
    id: `balita-${crypto.randomUUID()}`,
  };

  tulisSemua([...bacaSemua(), baru]);
  segarkanCache();

  return baru;
}

export function perbaruiBalita(id: string, data: Omit<Balita, "id">): void {
  tulisSemua(bacaSemua().map((b) => (b.id === id ? { ...data, id } : b)));
  segarkanCache();
}

export function hapusBalita(id: string): void {
  tulisSemua(bacaSemua().filter((b) => b.id !== id));
  segarkanCache();
}
