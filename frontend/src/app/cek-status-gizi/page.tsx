"use client";

import { Suspense, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faCheckCircle,
  faChild,
  faCircleExclamation,
  faClockRotateLeft,
  faLightbulb,
  faRulerVertical,
  faStethoscope,
  faTriangleExclamation,
  faWeightHanging,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { BigNumber, BigWord } from "@/components/ui/big-number";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BalitaPicker } from "@/components/balita-picker";
import {
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
import {
  analisisStatusGizi,
  type AnalisisGizi,
} from "@/lib/hitung-status-gizi";
import { formatUmur, hitungUmurBulan } from "@/lib/umur";
import { cn } from "@/lib/utils";
import { getRiwayatByBalita, simpanRiwayatCek } from "@/lib/riwayat-store";

const STATUS_STYLE: Record<
  StatusGizi,
  {
    icon: IconDefinition;
    badge: string;
    ring: string;
    text: string;
    img: string;
  }
> = {
  normal: {
    icon: faCheckCircle,
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    ring: "ring-emerald-200 dark:ring-emerald-900",
    text: "text-emerald-600 dark:text-emerald-400",
    img: "/images/results/risiko-rendah.webp",
  },
  kurang: {
    icon: faTriangleExclamation,
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ring: "ring-amber-200 dark:ring-amber-900",
    text: "text-amber-600 dark:text-amber-400",
    img: "/images/results/pemeriksaan-lanjutan.webp",
  },
  buruk: {
    icon: faCircleExclamation,
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    ring: "ring-rose-200 dark:ring-rose-900",
    text: "text-rose-600 dark:text-rose-400",
    img: "/images/results/pemeriksaan-lanjutan.webp",
  },
  pendek: {
    icon: faRulerVertical,
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    ring: "ring-violet-200 dark:ring-violet-900",
    text: "text-violet-600 dark:text-violet-400",
    img: "/images/results/pemeriksaan-lanjutan.webp",
  },
};

type HasilCek = AnalisisGizi & {
  umurBulan: number;
  tanggalCek: string;
};

function hariIni() {
  return new Date().toISOString().slice(0, 10);
}

function CekStatusGiziContent() {
  const searchParams = useSearchParams();
  const balitaList = useSyncExternalStore(
    subscribeBalita,
    getBalitaSnapshot,
    getBalitaServerSnapshot,
  );
  const [balitaId, setBalitaId] = useState<string>(
    () => searchParams.get("balita") ?? "",
  );
  const [tanggalCek, setTanggalCek] = useState(hariIni);
  const [beratKg, setBeratKg] = useState("");
  const [tinggiCm, setTinggiCm] = useState("");
  const [hasil, setHasil] = useState<HasilCek | null>(null);
  const [tersimpan, setTersimpan] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesanGagal, setPesanGagal] = useState("");
  const [versiRiwayat, setVersiRiwayat] = useState(0);

  const riwayatBalita = useMemo(() => {
    if (!balitaId) return [];
    return getRiwayatByBalita(balitaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balitaId, versiRiwayat]);

  const balitaTerpilih = useMemo(
    () => balitaList.find((b) => b.id === balitaId) ?? null,
    [balitaList, balitaId],
  );

  const umurSaatCek = useMemo(() => {
    if (!balitaTerpilih || !tanggalCek) return null;
    return hitungUmurBulan(balitaTerpilih.tanggalLahir, new Date(tanggalCek));
  }, [balitaTerpilih, tanggalCek]);

  const formValid =
    balitaId !== "" &&
    tanggalCek !== "" &&
    umurSaatCek !== null &&
    beratKg !== "" &&
    tinggiCm !== "";

  function handleCek() {
    if (!formValid || umurSaatCek === null) return;
    const analisis = analisisStatusGizi(
      umurSaatCek,
      Number(beratKg),
      Number(tinggiCm),
    );
    setHasil({
      ...analisis,
      umurBulan: umurSaatCek,
      tanggalCek,
    });
    setTersimpan(false);
    setPesanGagal("");
  }

  async function handleSimpan() {
    if (!hasil || tersimpan) return;

    setMenyimpan(true);
    const respons = await simpanRiwayatCek({
      balitaId,
      tanggalCek: hasil.tanggalCek,
      beratKg: hasil.beratKg,
      tinggiCm: hasil.tinggiCm,
    });
    setMenyimpan(false);

    if (!respons.berhasil) {
      setPesanGagal(respons.pesan);
      return;
    }

    // Selaraskan tampilan dengan hasil resmi dari server (Gomez/Waterlow),
    // yang bisa berbeda dari pratinjau lokal.
    setHasil({
      status: respons.hasil.status,
      beratKg: respons.hasil.beratKg,
      tinggiCm: respons.hasil.tinggiCm,
      beratIdealKg: respons.hasil.beratMedianKg,
      tinggiIdealCm: respons.hasil.tinggiMedianCm,
      rasioBerat: respons.hasil.rasioBerat,
      rasioTinggi: respons.hasil.rasioTinggi,
      umurBulan: respons.hasil.umurBulan,
      tanggalCek: respons.hasil.tanggalCek,
    });
    setVersiRiwayat((v) => v + 1);
    setTersimpan(true);
  }

  function handleGantiBalita(id: string) {
    setBalitaId(id);
    setHasil(null);
    setTersimpan(false);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-br from-sky-500 via-sky-400 to-emerald-400 px-4 py-8 text-white sm:rounded-b-3xl sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesomeIcon icon={faStethoscope} className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Cek Status Gizi
            </h1>
            <p className="text-sm text-sky-50/90">
              Hitung status gizi balita secara otomatis & akurat.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <Card className="border-sky-100 shadow-sm dark:border-sky-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faChild} className="size-4 text-sky-500" />
              Data Pemeriksaan
            </CardTitle>
            <CardDescription>
              Status gizi dihitung otomatis mengikuti standar WHO.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="balita">Pilih Balita</Label>
              <BalitaPicker
                id="balita"
                balitaList={balitaList}
                value={balitaId}
                onSelect={handleGantiBalita}
              />
              {balitaTerpilih && (
                <p className="text-xs text-zinc-500">
                  {formatUmur(hitungUmurBulan(balitaTerpilih.tanggalLahir))} ·{" "}
                  {balitaTerpilih.posyandu}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="tanggal-cek"
                className="flex items-center gap-1.5"
              >
                <FontAwesomeIcon
                  icon={faCalendarDay}
                  className="size-3.5 text-amber-500"
                />
                Tanggal Pemeriksaan
              </Label>
              <Input
                id="tanggal-cek"
                type="date"
                max={hariIni()}
                value={tanggalCek}
                onChange={(e) => setTanggalCek(e.target.value)}
              />
              {balitaTerpilih && umurSaatCek !== null && (
                <p className="text-xs text-zinc-500">
                  Umur saat pemeriksaan: {formatUmur(umurSaatCek)} (dihitung
                  otomatis dari tanggal lahir)
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="berat" className="flex items-center gap-1.5">
                  <FontAwesomeIcon
                    icon={faWeightHanging}
                    className="size-3.5 text-emerald-500"
                  />
                  Berat (kg)
                </Label>
                <Input
                  id="berat"
                  type="number"
                  min={0}
                  step="0.1"
                  inputMode="decimal"
                  placeholder="8.5"
                  value={beratKg}
                  onChange={(e) => setBeratKg(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tinggi" className="flex items-center gap-1.5">
                  <FontAwesomeIcon
                    icon={faRulerVertical}
                    className="size-3.5 text-violet-500"
                  />
                  Tinggi (cm)
                </Label>
                <Input
                  id="tinggi"
                  type="number"
                  min={0}
                  step="0.1"
                  inputMode="decimal"
                  placeholder="72"
                  value={tinggiCm}
                  onChange={(e) => setTinggiCm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-sky-500 hover:bg-sky-600"
              disabled={!formValid}
              onClick={handleCek}
            >
              <FontAwesomeIcon icon={faStethoscope} />
              Cek Status Gizi
            </Button>
          </CardFooter>
        </Card>

        {hasil ? (
          <Card
            className={cn("shadow-sm ring-2", STATUS_STYLE[hasil.status].ring)}
          >
            <CardHeader>
              <CardTitle>Hasil Pemeriksaan</CardTitle>
              <CardDescription>
                {balitaTerpilih?.nama} · {formatUmur(hasil.umurBulan)} ·{" "}
                {hasil.tanggalCek}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={STATUS_STYLE[hasil.status].img}
                  alt={STATUS_GIZI_LABEL[hasil.status]}
                  width={72}
                  height={72}
                  className="size-16 shrink-0 object-contain"
                />
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon
                    icon={STATUS_STYLE[hasil.status].icon}
                    className={cn("size-6", STATUS_STYLE[hasil.status].text)}
                  />
                  <BigWord className={STATUS_STYLE[hasil.status].text}>
                    {STATUS_GIZI_LABEL[hasil.status]}
                  </BigWord>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {STATUS_GIZI_DESKRIPSI[hasil.status]}
              </p>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <BigNumber
                  label="Berat badan"
                  value={hasil.beratKg}
                  unit="kg"
                  valueClassName="text-emerald-600 dark:text-emerald-400"
                />
                <BigNumber
                  label="Tinggi badan"
                  value={hasil.tinggiCm}
                  unit="cm"
                  valueClassName="text-violet-600 dark:text-violet-400"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                      <FontAwesomeIcon
                        icon={faWeightHanging}
                        className="size-3.5 text-emerald-500"
                      />
                      standar berat {hasil.beratIdealKg.toFixed(1)} kg
                    </span>
                  </div>
                  <Progress value={Math.min(hasil.rasioBerat * 100, 100)} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                      <FontAwesomeIcon
                        icon={faRulerVertical}
                        className="size-3.5 text-violet-500"
                      />
                      standar tinggi {hasil.tinggiIdealCm.toFixed(1)} cm
                    </span>
                  </div>
                  <Progress value={Math.min(hasil.rasioTinggi * 100, 100)} />
                </div>
              </div>

              <Separator />

              <div className="flex gap-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                <FontAwesomeIcon
                  icon={faLightbulb}
                  className="mt-0.5 size-3.5 shrink-0"
                />
                <p>{STATUS_GIZI_CATATAN[hasil.status]}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <ErrorMessage className="w-full">{pesanGagal}</ErrorMessage>
              <Button
                variant={tersimpan ? "secondary" : "default"}
                className={cn(
                  "w-full",
                  !tersimpan && "bg-emerald-500 hover:bg-emerald-600",
                )}
                disabled={tersimpan || menyimpan}
                onClick={handleSimpan}
              >
                {tersimpan
                  ? "Tersimpan ke Riwayat"
                  : menyimpan
                    ? "Menyimpan..."
                    : "Simpan Hasil Cek"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="hidden border-dashed shadow-none lg:flex lg:min-h-[240px] lg:items-center lg:justify-center">
            <p className="px-6 text-center text-sm text-zinc-400">
              Hasil pemeriksaan akan muncul di sini setelah kamu menekan
              &ldquo;Cek Status Gizi&rdquo;.
            </p>
          </Card>
        )}

        {balitaTerpilih && riwayatBalita.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className="size-4 text-amber-500"
                />
                Riwayat Tersimpan · {balitaTerpilih.nama}
              </CardTitle>
              <CardDescription>
                Tersimpan di server ({riwayatBalita.length} pemeriksaan).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {riwayatBalita.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="text-zinc-500">{r.tanggalCek}</span>
                  <span>
                    {r.beratKg} kg · {r.tinggiCm} cm
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      STATUS_STYLE[r.status].badge,
                    )}
                  >
                    {STATUS_GIZI_LABEL[r.status]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Image
          src="/images/banners/edukasi.webp"
          alt="Edukasi gizi seimbang untuk tumbuh kembang balita"
          width={1080}
          height={1080}
          className="w-full rounded-2xl lg:col-span-2"
        />
      </div>
    </div>
  );
}

export default function CekStatusGiziPage() {
  return (
    <Suspense fallback={null}>
      <CekStatusGiziContent />
    </Suspense>
  );
}
