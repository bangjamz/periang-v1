"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faMagnifyingGlass,
  faMars,
  faVenus,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Balita } from "@/lib/dummy-data";
import { formatUmur, hitungUmurBulan } from "@/lib/umur";
import { cn } from "@/lib/utils";

const AVATAR_COLOR: Record<Balita["jenisKelamin"], string> = {
  L: "bg-sky-100 text-sky-600",
  P: "bg-pink-100 text-pink-600",
};

type BalitaPickerProps = {
  balitaList: Balita[];
  value: string;
  onSelect: (id: string) => void;
  id?: string;
  placeholder?: string;
};

export function BalitaPicker({
  balitaList,
  value,
  onSelect,
  id,
  placeholder = "Pilih balita yang akan diperiksa",
}: BalitaPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const balitaTerpilih = balitaList.find((b) => b.id === value) ?? null;
  const label = balitaTerpilih
    ? `${balitaTerpilih.nama} · ${
        balitaTerpilih.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"
      }`
    : placeholder;

  const hasil = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return balitaList;
    return balitaList.filter(
      (b) =>
        b.nama.toLowerCase().includes(q) ||
        b.posyandu.toLowerCase().includes(q),
    );
  }, [balitaList, query]);

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            id={id}
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
          />
        }
      >
        <span className={cn(!balitaTerpilih && "text-muted-foreground")}>
          {label}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="size-3.5 text-muted-foreground"
        />
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] gap-4 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Pilih Balita</DialogTitle>
        </DialogHeader>

        <div className="px-4">
          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400"
            />
            <Input
              autoFocus
              placeholder="Cari nama balita atau posyandu..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex max-h-[55vh] flex-col gap-1 overflow-y-auto px-2 pb-4">
          {hasil.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">
              Tidak ada balita yang cocok dengan pencarian.
            </p>
          )}
          {hasil.map((b) => {
            const umurBulan = hitungUmurBulan(b.tanggalLahir);
            const isSelected = b.id === value;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelect(b.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900",
                  isSelected && "bg-sky-50 dark:bg-sky-950/40",
                )}
              >
                <Avatar className={cn(AVATAR_COLOR[b.jenisKelamin])}>
                  <AvatarFallback className="bg-transparent">
                    <FontAwesomeIcon
                      icon={b.jenisKelamin === "L" ? faMars : faVenus}
                      className="size-4"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{b.nama}</p>
                  <p className="text-xs text-zinc-500">
                    {formatUmur(umurBulan)} · {b.posyandu}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="size-3 text-zinc-300"
                />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
