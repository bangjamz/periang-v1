"use client";

import { use, useSyncExternalStore } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarDay,
  faCheckCircle,
  faCircleExclamation,
  faClockRotateLeft,
  faLightbulb,
  faMars,
  faRulerVertical,
  faTrash,
  faTriangleExclamation,
  faVenus,
  faWeightHanging,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { UbahRiwayatDialog } from "@/components/ubah-riwayat-dialog";
import {
  Balita,
  STATUS_GIZI_CATATAN,
  STATUS_GIZI_DESKRIPSI,
  STATUS_GIZI_LABEL,
  StatusGizi,
} from "@/lib/dummy-data";
import {
  getBalitaServerSnapshot,
  getBalitaSnapshot,
  subscribeBalita,
} from "@/lib/balita-store";
import { analisisStatusGizi } from "@/lib/hitung-status-gizi";
import {
  getRiwayatServerSnapshot,
  getRiwayatSnapshot,
  hapusRiwayatCek,
  subscribeRiwayat,
} from "@/lib/riwayat-store";
import { formatUmur } from "@/lib/umur";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const STATUS_STYLE: Record<
  StatusGizi,
  { icon: IconDefinition; badge: string; ring: string }
> = {
  normal: {
    icon: faCheckCircle,
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    ring: "ring-emerald-200 dark:ring-emerald-900",
  },
  kurang: {
    icon: faTriangleExclamation,
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ring: "ring-amber-200 dark:ring-amber-900",
  },
  buruk: {
    icon: faCircleExclamation,
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    ring: "ring-rose-200 dark:ring-rose-900",
  },
  pendek: {
    icon: faRulerVertical,
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    ring: "ring-violet-200 dark:ring-violet-900",
  },
};

const AVATAR_COLOR: Record<Balita["jenisKelamin"], string> = {
  L: "bg-sky-100 text-sky-600",
  P: "bg-pink-100 text-pink-600",
};

export default function DetailRiwayatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

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

  const entry = riwayat.find((r) => r.id === id) ?? null;
  const balita = entry
    ? (balitaList.find((b) => b.id === entry.balitaId) ?? null)
    : null;

  if (!entry) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <FontAwesomeIcon
          icon={faClockRotateLeft}
          className="size-6 text-zinc-300"
        />
        <p className="text-sm text-zinc-400">
          Data pemeriksaan tidak ditemukan. Mungkin sudah dihapus.
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/riwayat" />}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Kembali ke Riwayat
        </Button>
      </div>
    );
  }

  const analisis = analisisStatusGizi(
    entry.umurBulan,
    entry.beratKg,
    entry.tinggiCm,
  );

  async function handleHapus() {
    await hapusRiwayatCek(id);
    router.push("/riwayat");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-orange-400 px-4 py-8 text-white sm:rounded-b-3xl sm:px-8">
        <Link
          href="/riwayat"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-amber-50/90 hover:text-white"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="size-3.5" />
          Kembali ke Riwayat
        </Link>
        <div className="flex items-center gap-3">
          <Avatar
            size="lg"
            className={cn(
              balita ? AVATAR_COLOR[balita.jenisKelamin] : "bg-white/20",
            )}
          >
            <AvatarFallback className="bg-transparent text-white">
              <FontAwesomeIcon
                icon={balita?.jenisKelamin === "P" ? faVenus : faMars}
                className="size-4"
              />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {balita?.nama ?? "Balita tidak ditemukan"}
            </h1>
            <p className="text-sm text-amber-50/90">
              Detail pemeriksaan · {entry.tanggalCek}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-6 sm:mx-auto sm:w-full sm:max-w-xl sm:px-8">
        <Card
          className={cn("shadow-sm ring-2", STATUS_STYLE[entry.status].ring)}
        >
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
                  STATUS_STYLE[entry.status].badge,
                )}
              >
                <FontAwesomeIcon icon={STATUS_STYLE[entry.status].icon} />
                {STATUS_GIZI_LABEL[entry.status]}
              </div>
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <FontAwesomeIcon icon={faCalendarDay} className="size-3" />
                {formatUmur(entry.umurBulan)}
              </span>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {STATUS_GIZI_DESKRIPSI[entry.status]}
            </p>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <FontAwesomeIcon
                      icon={faWeightHanging}
                      className="size-3.5 text-emerald-500"
                    />
                    Berat badan
                  </span>
                  <span className="font-medium">
                    {entry.beratKg} kg{" "}
                    <span className="text-zinc-400">
                      / standar {analisis.beratIdealKg.toFixed(1)} kg
                    </span>
                  </span>
                </div>
                <Progress value={Math.min(analisis.rasioBerat * 100, 100)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <FontAwesomeIcon
                      icon={faRulerVertical}
                      className="size-3.5 text-violet-500"
                    />
                    Tinggi badan
                  </span>
                  <span className="font-medium">
                    {entry.tinggiCm} cm{" "}
                    <span className="text-zinc-400">
                      / standar {analisis.tinggiIdealCm.toFixed(1)} cm
                    </span>
                  </span>
                </div>
                <Progress value={Math.min(analisis.rasioTinggi * 100, 100)} />
              </div>
            </div>

            <Separator />

            <div className="flex gap-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
              <FontAwesomeIcon
                icon={faLightbulb}
                className="mt-0.5 size-3.5 shrink-0"
              />
              <p>{STATUS_GIZI_CATATAN[entry.status]}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-zinc-500">Catatan</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {entry.catatan ?? "Tidak ada catatan tambahan."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <UbahRiwayatDialog entry={entry} balita={balita} />

          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="outline" className="text-rose-600" />}
            >
              <FontAwesomeIcon icon={faTrash} />
              Hapus
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus pemeriksaan ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Catatan pemeriksaan {balita?.nama ?? "balita ini"} tanggal{" "}
                  {entry.tanggalCek} akan dihapus. Tindakan ini tidak bisa
                  dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={handleHapus}
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
