"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faRulerVertical,
  faStethoscope,
  faWeightHanging,
} from "@fortawesome/free-solid-svg-icons";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { BalitaPicker } from "@/components/balita-picker";
import {
  getBalitaServerSnapshot,
  getBalitaSnapshot,
  subscribeBalita,
} from "@/lib/balita-store";
import { standarBeratKg, standarTinggiCm } from "@/lib/hitung-status-gizi";
import {
  getRiwayatServerSnapshot,
  getRiwayatSnapshot,
  subscribeRiwayat,
} from "@/lib/riwayat-store";
import { hitungUmurBulan } from "@/lib/umur";

const UMUR_TITIK = Array.from({ length: 21 }, (_, i) => i * 3); // 0..60 bulan, step 3

const BERAT_CONFIG: ChartConfig = {
  normal: { label: "Rentang normal", color: "var(--color-emerald-400)" },
  standar: { label: "Standar (median)", color: "var(--color-emerald-400)" },
  batasBawah: { label: "Batas gizi kurang", color: "var(--color-amber-400)" },
  balita: { label: "Balita", color: "var(--color-sky-500)" },
};

const TINGGI_CONFIG: ChartConfig = {
  normal: { label: "Rentang normal", color: "var(--color-emerald-400)" },
  standar: { label: "Standar (median)", color: "var(--color-emerald-400)" },
  batasBawah: { label: "Batas stunting", color: "var(--color-amber-400)" },
  balita: { label: "Balita", color: "var(--color-violet-500)" },
};

export default function GrafikPage() {
  const balitaList = useSyncExternalStore(
    subscribeBalita,
    getBalitaSnapshot,
    getBalitaServerSnapshot,
  );
  const riwayat = useSyncExternalStore(
    subscribeRiwayat,
    getRiwayatSnapshot,
    getRiwayatServerSnapshot,
  );
  const [balitaId, setBalitaId] = useState("");

  const balitaTerpilih = useMemo(
    () => balitaList.find((b) => b.id === balitaId) ?? null,
    [balitaList, balitaId],
  );

  const riwayatBalita = useMemo(
    () =>
      riwayat
        .filter((r) => r.balitaId === balitaId)
        .sort((a, b) => a.umurBulan - b.umurBulan),
    [riwayat, balitaId],
  );

  const umurSaatIni = balitaTerpilih
    ? hitungUmurBulan(balitaTerpilih.tanggalLahir)
    : null;

  const titikUmur = useMemo(() => {
    const gabungan = new Set([
      ...UMUR_TITIK,
      ...riwayatBalita.map((r) => r.umurBulan),
    ]);
    return Array.from(gabungan).sort((a, b) => a - b);
  }, [riwayatBalita]);

  const dataBerat = useMemo(
    () =>
      titikUmur.map((umurBulan) => {
        const cocok = riwayatBalita.find((r) => r.umurBulan === umurBulan);
        const batasBawah = standarBeratKg(umurBulan) * 0.85;
        return {
          umurBulan,
          standar: Number(standarBeratKg(umurBulan).toFixed(2)),
          batasBawah: Number(batasBawah.toFixed(2)),
          normal: [
            Number(batasBawah.toFixed(2)),
            Number((standarBeratKg(umurBulan) * 1.3).toFixed(2)),
          ],
          balita: cocok?.beratKg,
        };
      }),
    [titikUmur, riwayatBalita],
  );

  const dataTinggi = useMemo(
    () =>
      titikUmur.map((umurBulan) => {
        const cocok = riwayatBalita.find((r) => r.umurBulan === umurBulan);
        const batasBawah = standarTinggiCm(umurBulan) * 0.85;
        return {
          umurBulan,
          standar: Number(standarTinggiCm(umurBulan).toFixed(2)),
          batasBawah: Number(batasBawah.toFixed(2)),
          normal: [
            Number(batasBawah.toFixed(2)),
            Number((standarTinggiCm(umurBulan) * 1.15).toFixed(2)),
          ],
          balita: cocok?.tinggiCm,
        };
      }),
    [titikUmur, riwayatBalita],
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 px-4 py-8 text-white sm:rounded-b-3xl sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesomeIcon icon={faChartLine} className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Grafik Pertumbuhan
            </h1>
            <p className="text-sm text-emerald-50/90">
              Bandingkan berat & tinggi balita dengan garis standar.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="balita-grafik">Pilih Balita</Label>
          <BalitaPicker
            id="balita-grafik"
            balitaList={balitaList}
            value={balitaId}
            onSelect={setBalitaId}
          />
        </div>

        {balitaList.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="size-6 text-zinc-300"
              />
              <p className="text-sm text-zinc-400">
                Belum ada data balita. Tambahkan balita terlebih dahulu untuk
                melihat grafik pertumbuhannya.
              </p>
              <Button
                size="sm"
                className="bg-pink-500 hover:bg-pink-600"
                render={<Link href="/balita" />}
                nativeButton={false}
              >
                Ke Halaman Data Balita
              </Button>
            </CardContent>
          </Card>
        )}

        {balitaList.length > 0 && !balitaTerpilih && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="size-6 text-zinc-300"
              />
              <p className="text-sm text-zinc-400">
                Pilih balita untuk melihat grafik pertumbuhannya.
              </p>
            </CardContent>
          </Card>
        )}

        {balitaTerpilih && riwayatBalita.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="size-6 text-zinc-300"
              />
              <p className="text-sm text-zinc-400">
                Belum ada riwayat pemeriksaan untuk {balitaTerpilih.nama}.
                Simpan hasil cek dari halaman Cek Status Gizi dulu.
              </p>
              <Button
                size="sm"
                className="bg-sky-500 hover:bg-sky-600"
                render={
                  <Link href={`/cek-status-gizi?balita=${balitaTerpilih.id}`} />
                }
                nativeButton={false}
              >
                <FontAwesomeIcon icon={faStethoscope} />
                Cek Status Gizi {balitaTerpilih.nama}
              </Button>
            </CardContent>
          </Card>
        )}

        {balitaTerpilih && riwayatBalita.length > 0 && (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faWeightHanging}
                    className="size-4 text-sky-500"
                  />
                  Kurva Berat Badan
                </CardTitle>
                <CardDescription>
                  {balitaTerpilih.nama} · umur saat ini{" "}
                  {umurSaatIni !== null ? `${umurSaatIni} bulan` : "-"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={BERAT_CONFIG} className="w-full">
                  <ComposedChart
                    data={dataBerat}
                    margin={{ left: 4, top: 8, bottom: 20 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="umurBulan"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}bln`}
                      label={{
                        value: "Umur (bulan)",
                        position: "insideBottom",
                        offset: -4,
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      label={{
                        value: "Berat (kg)",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 11,
                      }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      dataKey="normal"
                      stroke="none"
                      fill="var(--color-normal)"
                      fillOpacity={0.12}
                      isAnimationActive={false}
                    />
                    <Line
                      dataKey="standar"
                      stroke="var(--color-standar)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="batasBawah"
                      stroke="var(--color-batasBawah)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      dataKey="balita"
                      stroke="var(--color-balita)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faRulerVertical}
                    className="size-4 text-violet-500"
                  />
                  Kurva Tinggi Badan
                </CardTitle>
                <CardDescription>
                  {balitaTerpilih.nama} · umur saat ini{" "}
                  {umurSaatIni !== null ? `${umurSaatIni} bulan` : "-"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={TINGGI_CONFIG} className="w-full">
                  <ComposedChart
                    data={dataTinggi}
                    margin={{ left: 4, top: 8, bottom: 20 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="umurBulan"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}bln`}
                      label={{
                        value: "Umur (bulan)",
                        position: "insideBottom",
                        offset: -4,
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      label={{
                        value: "Tinggi (cm)",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 11,
                      }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      dataKey="normal"
                      stroke="none"
                      fill="var(--color-normal)"
                      fillOpacity={0.12}
                      isAnimationActive={false}
                    />
                    <Line
                      dataKey="standar"
                      stroke="var(--color-standar)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="batasBawah"
                      stroke="var(--color-batasBawah)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      dataKey="balita"
                      stroke="var(--color-balita)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
