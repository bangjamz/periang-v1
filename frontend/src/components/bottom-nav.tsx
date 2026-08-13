"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 sm:hidden dark:bg-black/95">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          if (!item.available) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                className="flex flex-1 cursor-not-allowed flex-col items-center gap-1 py-2 text-[11px] text-zinc-300 dark:text-zinc-700"
              >
                <FontAwesomeIcon icon={item.icon} className="size-5" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors",
                isActive
                  ? cn(item.color, "font-semibold")
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
