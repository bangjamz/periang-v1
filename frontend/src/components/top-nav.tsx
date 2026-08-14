"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/nav-items";
import { KaderChip } from "@/components/kader-chip";
import { HALAMAN_PUBLIK } from "@/lib/halaman-publik";

export function TopNav() {
  const pathname = usePathname();

  if (HALAMAN_PUBLIK.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 hidden border-b bg-white/95 backdrop-blur sm:block dark:bg-black/95">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
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

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            if (!item.available) {
              return (
                <span
                  key={item.href}
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-2 rounded-full px-3 py-2 text-sm text-zinc-300 dark:text-zinc-700"
                >
                  <FontAwesomeIcon icon={item.icon} className="size-4" />
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
                  isActive
                    ? cn(
                        item.color,
                        "bg-zinc-100 font-semibold dark:bg-zinc-900",
                      )
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200",
                )}
              >
                <FontAwesomeIcon icon={item.icon} className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <KaderChip />
      </div>
    </header>
  );
}
