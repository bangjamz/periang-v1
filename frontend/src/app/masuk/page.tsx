"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { masuk } from "@/lib/auth-store";

type FormState = {
  email: string;
  kataSandi: string;
};

const KOSONG: FormState = { email: "", kataSandi: "" };

function validasi(form: FormState): Partial<Record<keyof FormState, string>> {
  const error: Partial<Record<keyof FormState, string>> = {};

  if (form.email.trim() === "") {
    error.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    error.email = "Format email tidak valid.";
  }

  if (form.kataSandi === "") {
    error.kataSandi = "Kata sandi wajib diisi.";
  } else if (form.kataSandi.length < 6) {
    error.kataSandi = "Kata sandi minimal 6 karakter.";
  }

  return error;
}

export default function MasukPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(KOSONG);
  const [error, setError] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [pesanGagal, setPesanGagal] = useState("");
  const [memproses, setMemproses] = useState(false);

  function handleChange<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setPesanGagal("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errorBaru = validasi(form);
    setError(errorBaru);
    if (Object.keys(errorBaru).length > 0) return;

    setMemproses(true);
    const hasil = await masuk(form.email, form.kataSandi);
    setMemproses(false);

    if (!hasil.berhasil) {
      setPesanGagal(hasil.pesan);
      return;
    }

    router.push("/");
  }

  return (
    // Breakout dari app-shell (dibatasi max-w-5xl di layout.tsx untuk
    // halaman internal) supaya background gradasi memenuhi lebar layar
    // penuh. Satu kolom tunggal terpusat (bukan strip hero terpisah +
    // celah kosong) supaya seluruhnya muat tanpa scroll di layar kecil.
    <div className="relative left-1/2 -mb-[calc(4.5rem+env(safe-area-inset-bottom))] flex min-h-dvh w-screen -translate-x-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-3 sm:mb-0 dark:from-sky-950/40 dark:via-black dark:to-emerald-950/40">
      <div
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-900/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-900/30"
        aria-hidden
      />

      <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-zinc-900">
        {/* Gambar hero sengaja dilepas dulu (sempat terpotong jelek di
            mobile & terlalu tipis di desktop) — penanganan hero mobile vs
            desktop yang proper masuk rencana redesign terpisah, lihat
            backlog.md "Redesign Tampilan Desktop". */}
        <div className="flex flex-col items-center gap-0.5 px-6 pt-6">
          <Image
            src="/images/brand/app-icon-192.png"
            alt="Logo PERIANG"
            width={36}
            height={36}
            className="size-9 rounded-lg"
          />
          <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            PERIANG
          </h1>
          <p className="text-center text-[11px] text-zinc-500">
            Prediksi dan Analisis Balita Gizi Kurang
          </p>
        </div>

        <div className="px-6 pt-3 pb-1">
          <p className="text-sm font-semibold">Masuk</p>
          <p className="text-xs text-zinc-500">
            Masuk sebagai kader posyandu untuk mengelola data gizi balita.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2.5 px-6 pb-5"
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="nama@posyandu.id"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              aria-invalid={!!error.email}
            />
            {error.email && (
              <p className="text-xs text-rose-600">{error.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="kata-sandi">Kata Sandi</Label>
            <Input
              id="kata-sandi"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              value={form.kataSandi}
              onChange={(e) => handleChange("kataSandi", e.target.value)}
              aria-invalid={!!error.kataSandi}
            />
            {error.kataSandi && (
              <p className="text-xs text-rose-600">{error.kataSandi}</p>
            )}
            <Link
              href="/lupa-kata-sandi"
              className="self-end text-xs text-sky-600 hover:underline dark:text-sky-400"
            >
              Lupa kata sandi?
            </Link>
          </div>

          <ErrorMessage>{pesanGagal}</ErrorMessage>

          <Button
            type="submit"
            disabled={memproses}
            className="bg-sky-500 hover:bg-sky-600"
          >
            <FontAwesomeIcon icon={faRightToBracket} />
            {memproses ? "Memproses..." : "Masuk"}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <FontAwesomeIcon icon={faLock} className="size-3" />
            Demo: ratna.dewi@posyandu.id / posyandu123
          </p>
        </form>
      </div>
    </div>
  );
}
