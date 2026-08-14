"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { getAuthSnapshot } from "@/lib/auth-store";
import { HALAMAN_PUBLIK } from "@/lib/halaman-publik";
import { TourOverlay } from "@/components/tour/tour-overlay";

const KUNCI_TOUR_SELESAI = "periang_tour_selesai";

type TourContextValue = {
  mulaiTour: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour harus dipakai di dalam <TourProvider>");
  }
  return ctx;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [langkahAktif, setLangkahAktif] = useState<number | null>(null);
  const sudahDicoba = useRef(false);

  const mulaiTour = useCallback(() => {
    setLangkahAktif(0);
  }, []);

  const selesaiTour = useCallback((tandaiSelesai = true) => {
    setLangkahAktif(null);
    if (tandaiSelesai) {
      try {
        localStorage.setItem(KUNCI_TOUR_SELESAI, "1");
      } catch {
        // localStorage tidak tersedia (mis. mode privat) — abaikan.
      }
    }
  }, []);

  useEffect(() => {
    if (sudahDicoba.current) return;
    if (HALAMAN_PUBLIK.includes(pathname)) return;
    if (!getAuthSnapshot()) return;

    sudahDicoba.current = true;

    let sudahLihat = false;
    try {
      sudahLihat = localStorage.getItem(KUNCI_TOUR_SELESAI) === "1";
    } catch {
      sudahLihat = false;
    }

    // Sengaja tidak di-cleanup: di React Strict Mode (dev), effect ini
    // di-invoke dua kali (mount→cleanup→mount) — kalau timer dibatalkan di
    // cleanup, percobaan kedua tidak akan menjadwalkan ulang karena
    // `sudahDicoba` sudah terlanjur true, sehingga tour tidak pernah tampil.
    if (!sudahLihat) {
      setTimeout(() => setLangkahAktif(0), 700);
    }
  }, [pathname]);

  return (
    <TourContext.Provider value={{ mulaiTour }}>
      {children}
      {langkahAktif !== null && (
        <TourOverlay
          langkahIndex={langkahAktif}
          onUbahLangkah={setLangkahAktif}
          onSelesai={selesaiTour}
        />
      )}
    </TourContext.Provider>
  );
}
