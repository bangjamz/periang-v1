"use client";

import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";
import { KaderChip } from "@/components/kader-chip";
import { HALAMAN_PUBLIK } from "@/lib/halaman-publik";

export function MobileHeader() {
  const pathname = usePathname();

  if (HALAMAN_PUBLIK.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur sm:hidden dark:bg-black/95">
      <div className="flex items-center gap-2 font-semibold text-sky-600 dark:text-sky-400">
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-emerald-400 to-amber-300 text-white">
          <FontAwesomeIcon icon={faSeedling} className="size-4" />
        </span>
        PERIANG
      </div>

      <KaderChip compact />
    </header>
  );
}
