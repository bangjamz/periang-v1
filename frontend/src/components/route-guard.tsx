"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getAuthServerSnapshot,
  getAuthSnapshot,
  subscribeAuth,
} from "@/lib/auth-store";
import { HALAMAN_PUBLIK } from "@/lib/halaman-publik";

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
