"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getAuthServerSnapshot,
  getAuthSnapshot,
  subscribeAuth,
} from "@/lib/auth-store";
import { muatBalita } from "@/lib/balita-store";
import { HALAMAN_PUBLIK } from "@/lib/halaman-publik";
import { muatKader } from "@/lib/kader-store";
import { muatRiwayat } from "@/lib/riwayat-store";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );
  const halamanPublik = HALAMAN_PUBLIK.includes(pathname);

  useEffect(() => {
    // Baca status auth langsung dari store (bukan `isLoggedIn` dari render)
    // supaya tidak redirect keliru akibat getServerSnapshot() (selalu false)
    // yang sempat terpakai sesaat saat hydration sebelum snapshot klien sinkron.
    const statusTerkini = getAuthSnapshot();
    if (!halamanPublik && !statusTerkini) {
      router.replace("/masuk");
    } else if (halamanPublik && statusTerkini) {
      router.replace("/");
    } else if (statusTerkini) {
      // Segarkan profil kader, daftar balita & riwayat dari server (cache lokal bisa basi).
      void muatKader();
      void muatBalita();
      void muatRiwayat();
    }
  }, [pathname, halamanPublik, isLoggedIn, router]);

  // Belum login & bukan halaman publik → jangan render konten terproteksi
  // sambil menunggu redirect ke /masuk selesai.
  if (!halamanPublik && !isLoggedIn) return null;
  // Sudah login tapi masih di /masuk → jangan tampilkan form login sesaat
  // sebelum redirect ke halaman utama selesai.
  if (halamanPublik && isLoggedIn) return null;

  return <>{children}</>;
}
