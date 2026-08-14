"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faClipboardList,
  faLightbulb,
  faShieldHeart,
  faTriangleExclamation,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { BigNumber, BigWord } from "@/components/ui/big-number";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BalitaPicker } from "@/components/balita-picker";
import { FaktorRisikoForm } from "@/components/faktor-risiko-form";
import {
  getBalitaServerSnapshot,
  getBalitaSnapshot,
  subscribeBalita,
} from "@/lib/balita-store";
import {
  FaktorRisiko,
  getFaktorRisikoByBalita,
  getFaktorRisikoServerSnapshot,
  getFaktorRisikoSnapshot,
  muatFaktorRisiko,
  subscribeFaktorRisiko,
} from "@/lib/faktor-risiko-store";
import {
  ambilPrediksiRisiko,
  HasilPrediksi,
  TingkatRisiko,
} from "@/lib/prediksi-risiko";
import { cn } from "@/lib/utils";

const STATUS_RISIKO: Record<
  TingkatRisiko,
  {
    label: string;
    icon: IconDefinition;
    badge: string;
    ring: string;
    text: string;
    img: string;
  }
> = {
  rendah: {
    label: "Risiko Rendah",
    icon: faCircleCheck,
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    ring: "ring-emerald-200 dark:ring-emerald-900",
    text: "text-emerald-600 dark:text-emerald-400",
    img: "/images/results/risiko-rendah.webp",
  },
  sedang: {
    label: "Risiko Sedang",
    icon: faTriangleExclamation,
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ring: "ring-amber-200 dark:ring-amber-900",
    text: "text-amber-600 dark:text-amber-400",
    img: "/images/results/pemeriksaan-lanjutan.webp",
  },
  tinggi: {
    label: "Risiko Tinggi",
    icon: faCircleExclamation,
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    ring: "ring-rose-200 dark:ring-rose-900",
    text: "text-rose-600 dark:text-rose-400",
    img: "/images/results/pemeriksaan-lanjutan.webp",
  },
};

export default function PrediksiPage() {
  const balitaList = useSyncExternalStore(
    subscribeBalita,
    getBalitaSnapshot,
    getBalitaServerSnapshot,
  );
  const semuaFaktorRisiko = useSyncExternalStore(
    subscribeFaktorRisiko,
    getFaktorRisikoSnapshot,
    getFaktorRisikoServerSnapshot,
  );
  const [balitaId, setBalitaId] = useState("");
  const [hasilPrediksi, setHasilPrediksi] = useState<HasilPrediksi | null>(
    null,
  );
  const [pesanGagalPrediksi, setPesanGagalPrediksi] = useState("");

  const balitaTerpilih = useMemo(
    () => balitaList.find((b) => b.id === balitaId) ?? null,
    [balitaList, balitaId],
  );

  const faktorRisiko: FaktorRisiko | null = useMemo(() => {
    if (!balitaId) return null;
    return (
      semuaFaktorRisiko.find((f) => f.balitaId === balitaId) ??
      getFaktorRisikoByBalita(balitaId)
    );
  }, [semuaFaktorRisiko, balitaId]);

  useEffect(() => {
    if (balitaId) void muatFaktorRisiko(balitaId);
  }, [balitaId]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!faktorRisiko) {
      setHasilPrediksi(null);
      return;
    }

    let batal = false;
    setPesanGagalPrediksi("");
    void ambilPrediksiRisiko(faktorRisiko.balitaId).then((hasil) => {
      if (batal) return;
      if (!hasil.berhasil) {
        setPesanGagalPrediksi(hasil.pesan);
        setHasilPrediksi(null);
        return;
      }
      setHasilPrediksi(hasil.hasil);
    });

    return () => {
      batal = true;
    };
  }, [faktorRisiko]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-br from-violet-500 via-violet-400 to-fuchsia-400 px-4 py-8 text-white sm:rounded-b-3xl sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesomeIcon icon={faShieldHeart} className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Prediksi Risiko
            </h1>
            <p className="text-sm text-violet-50/90">
              Perkirakan risiko gizi kurang dari faktor riwayat balita.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <Card className="border-violet-100 shadow-sm dark:border-violet-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faClipboardList}
                className="size-4 text-violet-500"
              />
              Faktor Risiko
            </CardTitle>
            <CardDescription>
              Isi data riwayat lahir, imunisasi, dan sanitasi balita.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="balita-prediksi">Pilih Balita</Label>
              <BalitaPicker
                id="balita-prediksi"
                balitaList={balitaList}
                value={balitaId}
                onSelect={setBalitaId}
              />
              {balitaTerpilih && (
                <p className="text-xs text-zinc-500">
                  {balitaTerpilih.posyandu}
                </p>
              )}
            </div>

            {!balitaTerpilih && (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-zinc-400">
                Pilih balita untuk mulai mengisi faktor risiko.
              </p>
            )}

            {balitaTerpilih && (
              <>
                <Separator />
                <FaktorRisikoForm
                  key={balitaTerpilih.id}
                  balitaId={balitaTerpilih.id}
                />
              </>
            )}
          </CardContent>
        </Card>

        {hasilPrediksi && balitaTerpilih ? (
          <Card
            className={cn(
              "shadow-sm ring-2",
              STATUS_RISIKO[hasilPrediksi.tingkatRisiko].ring,
            )}
          >
            <CardHeader>
              <CardTitle>Hasil Prediksi Risiko</CardTitle>
              <CardDescription>{balitaTerpilih.nama}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={STATUS_RISIKO[hasilPrediksi.tingkatRisiko].img}
                  alt={STATUS_RISIKO[hasilPrediksi.tingkatRisiko].label}
                  width={72}
                  height={72}
                  className="size-16 shrink-0 object-contain"
                />
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon
                    icon={STATUS_RISIKO[hasilPrediksi.tingkatRisiko].icon}
                    className={cn(
                      "size-6",
                      STATUS_RISIKO[hasilPrediksi.tingkatRisiko].text,
                    )}
                  />
                  <BigWord
                    className={STATUS_RISIKO[hasilPrediksi.tingkatRisiko].text}
                  >
                    {STATUS_RISIKO[hasilPrediksi.tingkatRisiko].label}
                  </BigWord>
                </div>
              </div>

              <p
                className={cn(
                  "rounded-lg p-3 text-sm font-medium",
                  STATUS_RISIKO[hasilPrediksi.tingkatRisiko].badge,
                )}
              >
                {hasilPrediksi.rekomendasiUmum}
              </p>

              <div className="flex flex-col gap-1.5">
                <BigNumber
                  label="Skor risiko"
                  value={hasilPrediksi.skor}
                  unit={`/ ${hasilPrediksi.skorMaksimal}`}
                  valueClassName={
                    STATUS_RISIKO[hasilPrediksi.tingkatRisiko].text
                  }
                />
                <Progress
                  value={
                    (hasilPrediksi.skor / hasilPrediksi.skorMaksimal) * 100
                  }
                />
              </div>

              {hasilPrediksi.faktorKontribusi.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium text-zinc-500">
                      Faktor yang berkontribusi
                    </p>
                    <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {hasilPrediksi.faktorKontribusi.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-zinc-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex flex-col gap-1.5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                  <FontAwesomeIcon icon={faLightbulb} className="size-3" />
                  Rekomendasi berdasarkan faktor risiko
                </p>
                <ul className="flex flex-col gap-1.5">
                  {hasilPrediksi.rekomendasi.map((r) => (
                    <li
                      key={r}
                      className="rounded-lg bg-sky-50 p-2.5 text-sm text-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="hidden border-dashed shadow-none lg:flex lg:min-h-[240px] lg:items-center lg:justify-center">
            <p className="px-6 text-center text-sm text-zinc-400">
              {pesanGagalPrediksi
                ? pesanGagalPrediksi
                : balitaTerpilih
                  ? "Isi & simpan faktor risiko untuk melihat hasil prediksi."
                  : "Hasil prediksi risiko akan muncul di sini setelah faktor risiko diisi."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
