"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/nav-items";
import { HALAMAN_PUBLIK } from "@/lib/halaman-publik";

export function BottomNav() {
  const pathname = usePathname();

  if (HALAMAN_PUBLIK.includes(pathname)) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-white/80 sm:hidden dark:bg-black/95">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-between gap-1 px-2 pt-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          if (!item.available) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                className="flex min-h-14 flex-1 cursor-not-allowed flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-semibold text-zinc-300 dark:text-zinc-700"
              >
                <FontAwesomeIcon icon={item.icon} className="size-6" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-semibold transition-colors",
                isActive
                  ? cn(item.color, item.bg)
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200",
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="size-6" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
