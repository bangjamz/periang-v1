"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBaby,
  faMagnifyingGlass,
  faMars,
  faStethoscope,
  faVenus,
} from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BigNumber } from "@/components/ui/big-number";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BalitaFormDialog } from "@/components/balita-form-dialog";
import { HapusBalitaButton } from "@/components/hapus-balita-button";
import { IndikatorMemuat } from "@/components/ui/spinner";
import { Balita, JenisKelamin } from "@/lib/dummy-data";
import {
  getBalitaServerSnapshot,
  getBalitaSnapshot,
  isBalitaMemuat,
  subscribeBalita,
} from "@/lib/balita-store";
import { formatUmur, hitungUmurBulan } from "@/lib/umur";
import { cn } from "@/lib/utils";

const AVATAR_COLOR: Record<Balita["jenisKelamin"], string> = {
  L: "bg-sky-100 text-sky-600",
  P: "bg-pink-100 text-pink-600",
};

export default function BalitaPage() {
  const balitaList = useSyncExternalStore(
    subscribeBalita,
    getBalitaSnapshot,
    getBalitaServerSnapshot,
  );
  const memuat = useSyncExternalStore(
    subscribeBalita,
    isBalitaMemuat,
    () => true,
  );
  const [query, setQuery] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin | "">("");
  const [posyandu, setPosyandu] = useState("");

  const daftarPosyandu = useMemo(
    () => Array.from(new Set(balitaList.map((b) => b.posyandu))).sort(),
    [balitaList],
  );

  const hasil = useMemo(() => {
    const q = query.trim().toLowerCase();
    return balitaList.filter((b) => {
      const cocokQuery =
        q === "" ||
        b.nama.toLowerCase().includes(q) ||
        b.posyandu.toLowerCase().includes(q);
      const cocokJenisKelamin =
        jenisKelamin === "" || b.jenisKelamin === jenisKelamin;
      const cocokPosyandu = posyandu === "" || b.posyandu === posyandu;

      return cocokQuery && cocokJenisKelamin && cocokPosyandu;
    });
  }, [balitaList, query, jenisKelamin, posyandu]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-br from-pink-500 via-pink-400 to-rose-400 px-4 py-8 text-white sm:rounded-b-3xl sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20">
              <FontAwesomeIcon icon={faBaby} className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Data Balita
              </h1>
              <p className="text-sm text-pink-50/90">
                Kelola data pokok balita di posyandu Anda.
              </p>
            </div>
          </div>
          <Image
            src="/images/characters/ibu-balita.webp"
            alt="Ilustrasi ibu dan balita"
            width={72}
            height={72}
            className="hidden size-16 shrink-0 rounded-2xl object-cover sm:block"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400"
            />
            <Input
              placeholder="Cari nama balita atau posyandu..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <BalitaFormDialog mode="tambah" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1.5 rounded-lg border p-1">
            {(
              [
                { value: "", label: "Semua" },
                { value: "L", label: "Laki-laki" },
                { value: "P", label: "Perempuan" },
              ] as const
            ).map((opsi) => (
              <Button
                key={opsi.value}
                type="button"
                size="sm"
                variant={jenisKelamin === opsi.value ? "default" : "ghost"}
                className={cn(
                  jenisKelamin === opsi.value &&
                    "bg-pink-500 hover:bg-pink-600",
                )}
                onClick={() => setJenisKelamin(opsi.value)}
              >
                {opsi.label}
              </Button>
            ))}
          </div>

          <Select
            value={posyandu === "" ? "semua" : posyandu}
            onValueChange={(v) => setPosyandu(!v || v === "semua" ? "" : v)}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Semua posyandu">
                {() => (posyandu === "" ? "Semua posyandu" : posyandu)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua posyandu</SelectItem>
              {daftarPosyandu.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-xs text-zinc-400 sm:ml-auto">
            {hasil.length} balita ditemukan
          </p>
        </div>

        {memuat && hasil.length === 0 && (
          <IndikatorMemuat label="Memuat data balita..." />
        )}

        {!memuat && hasil.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <Image
                src="/images/onboarding/empty-state.webp"
                alt="Belum ada data balita"
                width={200}
                height={200}
                className="size-40 object-contain"
              />
              <p className="text-sm text-zinc-400">
                Tidak ada balita yang cocok dengan pencarian.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map((b) => {
            const umurBulan = hitungUmurBulan(b.tanggalLahir);

            return (
              <Card key={b.id} className="shadow-sm">
                <CardContent className="flex flex-col gap-3 py-1">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="lg"
                      className={cn(AVATAR_COLOR[b.jenisKelamin])}
                    >
                      <AvatarFallback className="bg-transparent">
                        <FontAwesomeIcon
                          icon={b.jenisKelamin === "L" ? faMars : faVenus}
                          className="size-4"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{b.nama}</p>
                      <p className="text-xs text-zinc-400">{b.posyandu}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <BalitaFormDialog mode="ubah" balita={b} />
                      <HapusBalitaButton balita={b} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                    <BigNumber
                      value={umurBulan}
                      unit="bulan"
                      valueClassName={cn(
                        "text-xl sm:text-2xl",
                        b.jenisKelamin === "L"
                          ? "text-sky-600 dark:text-sky-400"
                          : "text-pink-600 dark:text-pink-400",
                      )}
                    />
                    <span className="text-xs text-zinc-500">
                      {formatUmur(umurBulan)} ·{" "}
                      {b.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    nativeButton={false}
                    className="w-full bg-sky-500 hover:bg-sky-600"
                    render={<Link href={`/cek-status-gizi?balita=${b.id}`} />}
                  >
                    <FontAwesomeIcon icon={faStethoscope} />
                    Periksa Status Gizi
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
