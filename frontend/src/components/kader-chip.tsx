"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { keluar } from "@/lib/auth-store";
import {
  getKaderServerSnapshot,
  getKaderSnapshot,
  subscribeKader,
} from "@/lib/kader-store";
import { cn } from "@/lib/utils";

function Avatar({ inisial }: { inisial: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-emerald-400 to-amber-300 text-xs font-semibold text-white">
      {inisial}
    </span>
  );
}

export function KaderChip({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const kader = useSyncExternalStore(
    subscribeKader,
    getKaderSnapshot,
    getKaderServerSnapshot,
  );

  function handleKeluar() {
    keluar();
    router.push("/masuk");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-tour="kader-chip"
        className={cn(
          "flex items-center gap-2 rounded-full border bg-zinc-50 py-1 pr-3 pl-1 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:bg-zinc-900",
          compact && "border-none bg-transparent p-0",
          className,
        )}
      >
        <Avatar inisial={kader.inisial} />
        {!compact && (
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {kader.nama}
            </p>
            <p className="text-xs text-zinc-400">{kader.posyandu}</p>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="font-medium text-zinc-700 dark:text-zinc-200">
            {kader.nama}
          </p>
          <p className="text-xs font-normal text-zinc-400">{kader.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<a href="/akun" />}
          onClick={(e) => {
            e.preventDefault();
            router.push("/akun");
          }}
        >
          <FontAwesomeIcon icon={faUser} />
          Profil Saya
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleKeluar}>
          <FontAwesomeIcon icon={faRightFromBracket} />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
