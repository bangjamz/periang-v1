"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleCheck,
  faCircleExclamation,
  faFloppyDisk,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetKataSandi } from "@/lib/auth-store";

type FormState = {
  kataSandiBaru: string;
  konfirmasi: string;
};

const KOSONG: FormState = { kataSandiBaru: "", konfirmasi: "" };

function validasi(form: FormState): Partial<Record<keyof FormState, string>> {
  const error: Partial<Record<keyof FormState, string>> = {};

  if (form.kataSandiBaru === "") {
    error.kataSandiBaru = "Kata sandi baru wajib diisi.";
  } else if (form.kataSandiBaru.length < 6) {
    error.kataSandiBaru = "Kata sandi baru minimal 6 karakter.";
  }
  if (form.konfirmasi !== form.kataSandiBaru) {
    error.konfirmasi = "Konfirmasi kata sandi tidak cocok.";
  }

  return error;
}

function Wadah({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center gap-2">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-emerald-400 to-amber-300 text-white">
          <FontAwesomeIcon icon={faSeedling} className="size-6" />
        </span>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          PERIANG
        </h1>
        <p className="text-center text-sm text-zinc-500">
          Prediksi dan Analisis Balita Gizi Kurang
        </p>
      </div>
      {children}
    </div>
  );
}

function ResetKataSandiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState<FormState>(KOSONG);
  const [error, setError] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [berhasil, setBerhasil] = useState(false);

  if (!token) {
    return (
      <Wadah>
        <Card className="w-full max-w-sm border-zinc-100 shadow-sm dark:border-zinc-800">
          <CardContent className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
              <FontAwesomeIcon icon={faCircleExclamation} className="size-6" />
            </span>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.
            </p>
            <Button
              variant="secondary"
              render={<Link href="/lupa-kata-sandi" />}
              nativeButton={false}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Minta Tautan Baru
            </Button>
          </CardContent>
        </Card>
      </Wadah>
    );
  }

  function handleChange<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errorBaru = validasi(form);
    setError(errorBaru);
    if (Object.keys(errorBaru).length > 0) return;

    resetKataSandi(form.kataSandiBaru);
    setBerhasil(true);
  }

  return (
    <Wadah>
      <Card className="w-full max-w-sm border-zinc-100 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Atur Ulang Kata Sandi</CardTitle>
          <CardDescription>
            Masukkan kata sandi baru untuk akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {berhasil ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <FontAwesomeIcon icon={faCircleCheck} className="size-6" />
              </span>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi
                baru Anda.
              </p>
              <Button
                className="bg-sky-500 hover:bg-sky-600"
                onClick={() => router.push("/masuk")}
              >
                Ke Halaman Masuk
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="kata-sandi-baru">Kata Sandi Baru</Label>
                <Input
                  id="kata-sandi-baru"
                  type="password"
                  autoComplete="new-password"
                  value={form.kataSandiBaru}
                  onChange={(e) =>
                    handleChange("kataSandiBaru", e.target.value)
                  }
                  aria-invalid={!!error.kataSandiBaru}
                />
                {error.kataSandiBaru && (
                  <p className="text-xs text-rose-600">{error.kataSandiBaru}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="konfirmasi-kata-sandi">
                  Konfirmasi Kata Sandi Baru
                </Label>
                <Input
                  id="konfirmasi-kata-sandi"
                  type="password"
                  autoComplete="new-password"
                  value={form.konfirmasi}
                  onChange={(e) => handleChange("konfirmasi", e.target.value)}
                  aria-invalid={!!error.konfirmasi}
                />
                {error.konfirmasi && (
                  <p className="text-xs text-rose-600">{error.konfirmasi}</p>
                )}
              </div>

              <Button type="submit" className="bg-sky-500 hover:bg-sky-600">
                <FontAwesomeIcon icon={faFloppyDisk} />
                Simpan Kata Sandi Baru
              </Button>

              <Link
                href="/masuk"
                className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="size-3" />
                Kembali ke Halaman Masuk
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </Wadah>
  );
}

export default function ResetKataSandiPage() {
  return (
    <Suspense fallback={null}>
      <ResetKataSandiContent />
    </Suspense>
  );
}
