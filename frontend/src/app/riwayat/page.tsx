"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleExclamation,
  faClockRotateLeft,
  faMagnifyingGlass,
  faRulerVertical,
  faTrash,
  faTriangleExclamation,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DUMMY_BALITA, STATUS_GIZI_LABEL, StatusGizi } from "@/lib/dummy-data";
import {
  getRiwayatServerSnapshot,
  getRiwayatSnapshot,
  hapusRiwayatCek,
  subscribeRiwayat,
} from "@/lib/riwayat-store";
import { formatUmur } from "@/lib/umur";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<
  StatusGizi,
  { icon: IconDefinition; badge: string }
> = {
  normal: {
    icon: faCheckCircle,
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  kurang: {
    icon: faTriangleExclamation,
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  buruk: {
    icon: faCircleExclamation,
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
  pendek: {
    icon: faRulerVertical,
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
};

export default function RiwayatPage() {
  const riwayat = useSyncExternalStore(
    subscribeRiwayat,
    getRiwayatSnapshot,
    getRiwayatServerSnapshot,
  );
  const [query, setQuery] = useState("");

  const hasil = useMemo(() => {
    const q = query.trim().toLowerCase();
    return riwayat
      .map((r) => ({
        entry: r,
        balita: DUMMY_BALITA.find((b) => b.id === r.balitaId) ?? null,
      }))
      .filter(({ balita }) =>
        q ? (balita?.nama.toLowerCase().includes(q) ?? false) : true,
      );
  }, [riwayat, query]);

  function handleHapus(id: string) {
    hapusRiwayatCek(id);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-orange-400 px-4 py-8 text-white sm:rounded-b-3xl sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesomeIcon icon={faClockRotateLeft} className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Riwayat Pemeriksaan
            </h1>
            <p className="text-sm text-amber-50/90">
              Hasil cek status gizi yang tersimpan di perangkat ini.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
        <div className="relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400"
          />
          <Input
            placeholder="Cari nama balita..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {hasil.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className="size-6 text-zinc-300"
              />
              <p className="text-sm text-zinc-400">
                {riwayat.length === 0
                  ? "Belum ada riwayat pemeriksaan tersimpan. Simpan hasil cek dari halaman Cek Status Gizi."
                  : "Tidak ada riwayat yang cocok dengan pencarian."}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map(({ entry, balita }) => (
            <Card key={entry.id} className="shadow-sm">
              <CardContent className="flex flex-col gap-2 py-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {balita?.nama ?? "Balita tidak ditemukan"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {entry.tanggalCek} · {formatUmur(entry.umurBulan)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                      STATUS_STYLE[entry.status].badge,
                    )}
                  >
                    <FontAwesomeIcon icon={STATUS_STYLE[entry.status].icon} />
                    {STATUS_GIZI_LABEL[entry.status]}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>
                    {entry.beratKg} kg · {entry.tinggiCm} cm
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-zinc-400 hover:text-rose-600"
                    onClick={() => handleHapus(entry.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="size-3.5" />
                    <span className="sr-only">Hapus</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
