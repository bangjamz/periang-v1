"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleCheck,
  faPaperPlane,
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

function validasiEmail(email: string): string | undefined {
  if (email.trim() === "") {
    return "Email wajib diisi.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Format email tidak valid.";
  }
  return undefined;
}

export default function LupaKataSandiPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [terkirim, setTerkirim] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errorBaru = validasiEmail(email);
    setError(errorBaru);
    if (errorBaru) return;

    // Belum tersambung ke backend/pengirim email — simulasi tiruan saja.
    setTerkirim(true);
  }

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

      <Card className="w-full max-w-sm border-zinc-100 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Lupa Kata Sandi</CardTitle>
          <CardDescription>
            Masukkan email akun Anda, kami akan mengirimkan tautan atur ulang
            kata sandi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {terkirim ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <FontAwesomeIcon icon={faCircleCheck} className="size-6" />
              </span>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Jika <strong>{email}</strong> terdaftar, tautan atur ulang kata
                sandi telah dikirim. Silakan cek email Anda.
              </p>
              <Link
                href="/reset-kata-sandi?token=demo"
                className="text-xs text-sky-600 hover:underline dark:text-sky-400"
              >
                (Demo) Buka tautan reset kata sandi
              </Link>
              <Button
                variant="secondary"
                render={<Link href="/masuk" />}
                nativeButton={false}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Kembali ke Halaman Masuk
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="nama@posyandu.id"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(undefined);
                  }}
                  aria-invalid={!!error}
                />
                {error && <p className="text-xs text-rose-600">{error}</p>}
              </div>

              <Button type="submit" className="bg-sky-500 hover:bg-sky-600">
                <FontAwesomeIcon icon={faPaperPlane} />
                Kirim Tautan Reset
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
    </div>
  );
}
