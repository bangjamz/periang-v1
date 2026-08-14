"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { KaderChip } from "@/components/kader-chip";
import { HALAMAN_PUBLIK } from "@/lib/halaman-publik";

export function MobileHeader() {
  const pathname = usePathname();

  if (HALAMAN_PUBLIK.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur sm:hidden dark:bg-black/95">
      <div className="flex items-center gap-2 font-semibold text-sky-600 dark:text-sky-400">
        <Image
          src="/images/brand/app-icon-48.png"
          alt="Logo PERIANG"
          width={32}
          height={32}
          className="size-8 rounded-full"
          priority
        />
        PERIANG
      </div>

      <KaderChip compact />
    </header>
  );
}
