"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleExclamation,
  faClockRotateLeft,
  faMagnifyingGlass,
  faMars,
  faQuestion,
  faRulerVertical,
  faTrash,
  faTriangleExclamation,
  faVenus,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IndikatorMemuat } from "@/components/ui/spinner";
import { Balita, STATUS_GIZI_LABEL, StatusGizi } from "@/lib/dummy-data";
import {
  getBalitaServerSnapshot,
  getBalitaSnapshot,
  subscribeBalita,
} from "@/lib/balita-store";
import {
  getRiwayatServerSnapshot,
  getRiwayatSnapshot,
  hapusRiwayatCek,
  isRiwayatMemuat,
  subscribeRiwayat,
  type RiwayatCek,
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

const AVATAR_COLOR: Record<Balita["jenisKelamin"], string> = {
  L: "bg-sky-100 text-sky-600",
  P: "bg-pink-100 text-pink-600",
};

type GrupRiwayat = {
  balitaId: string;
  balita: Balita | null;
  entries: RiwayatCek[];
};

export default function RiwayatPage() {
  const riwayat = useSyncExternalStore(
    subscribeRiwayat,
    getRiwayatSnapshot,
    getRiwayatServerSnapshot,
  );
  const balitaList = useSyncExternalStore(
    subscribeBalita,
    getBalitaSnapshot,
    getBalitaServerSnapshot,
  );
  const memuat = useSyncExternalStore(
    subscribeRiwayat,
    isRiwayatMemuat,
    () => true,
  );
  const [query, setQuery] = useState("");

  const grup = useMemo(() => {
    const q = query.trim().toLowerCase();
    const peta = new Map<string, GrupRiwayat>();

    for (const entry of riwayat) {
      if (!peta.has(entry.balitaId)) {
        peta.set(entry.balitaId, {
          balitaId: entry.balitaId,
          balita: balitaList.find((b) => b.id === entry.balitaId) ?? null,
          entries: [],
        });
      }
      peta.get(entry.balitaId)!.entries.push(entry);
    }

    return Array.from(peta.values())
      .filter((g) =>
        q ? (g.balita?.nama.toLowerCase().includes(q) ?? false) : true,
      )
      .sort((a, b) =>
        b.entries[0].createdAt.localeCompare(a.entries[0].createdAt),
      );
  }, [riwayat, balitaList, query]);

  function handleHapus(id: string) {
    void hapusRiwayatCek(id);
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
              Riwayat Cek
            </h1>
            <p className="text-sm text-amber-50/90">
              Semua hasil cek status gizi, dikelompokkan per balita.
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

        {memuat && grup.length === 0 && (
          <IndikatorMemuat label="Memuat riwayat pemeriksaan..." />
        )}

        {!memuat && grup.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <Image
                src="/images/onboarding/empty-state.webp"
                alt="Belum ada riwayat pemeriksaan"
                width={200}
                height={200}
                className="size-40 object-contain"
              />
              <p className="text-sm text-zinc-400">
                {riwayat.length === 0
                  ? "Belum ada riwayat pemeriksaan tersimpan. Simpan hasil cek dari halaman Cek Status Gizi."
                  : "Tidak ada riwayat yang cocok dengan pencarian."}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          {grup.map(({ balitaId, balita, entries }) => (
            <Card key={balitaId} className="shadow-sm">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Avatar
                  className={cn(
                    balita
                      ? AVATAR_COLOR[balita.jenisKelamin]
                      : "bg-zinc-100 text-zinc-400",
                  )}
                >
                  <AvatarFallback className="bg-transparent">
                    <FontAwesomeIcon
                      icon={
                        !balita
                          ? faQuestion
                          : balita.jenisKelamin === "L"
                            ? faMars
                            : faVenus
                      }
                      className="size-3.5"
                    />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>
                    {balita?.nama ?? "Balita tidak ditemukan"}
                  </CardTitle>
                  <p className="text-xs text-zinc-500">
                    {entries.length} pemeriksaan
                    {balita ? ` · ${balita.posyandu}` : ""}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Link
                      href={`/riwayat/${entry.id}`}
                      className="flex flex-1 flex-wrap items-center gap-2 hover:underline"
                    >
                      <span className="text-zinc-500">
                        {entry.tanggalCek} · {formatUmur(entry.umurBulan)}
                      </span>
                      <span className="text-base font-bold tabular-nums">
                        {entry.beratKg} kg · {entry.tinggiCm} cm
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          STATUS_STYLE[entry.status].badge,
                        )}
                      >
                        <FontAwesomeIcon
                          icon={STATUS_STYLE[entry.status].icon}
                        />
                        {STATUS_GIZI_LABEL[entry.status]}
                      </span>
                    </Link>
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
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
