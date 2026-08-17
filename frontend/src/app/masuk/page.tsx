"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { masuk } from "@/lib/auth-store";

type FormState = {
  email: string;
  kataSandi: string;
};

const KOSONG: FormState = { email: "", kataSandi: "" };

const LANGKAH = [
  {
    src: "/images/onboarding/step-1.webp",
    label: "1. Isi Data Balita",
  },
  {
    src: "/images/onboarding/step-2.webp",
    label: "2. Analisis Otomatis",
  },
  {
    src: "/images/onboarding/step-3.webp",
    label: "3. Lihat Hasil",
  },
] as const;

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
    // halaman internal) supaya split hero+form memenuhi lebar layar penuh
    // di desktop, bukan terjepit sempit di tengah dengan banyak ruang
    // kosong kiri-kanan.
    <div className="relative left-1/2 flex w-screen -translate-x-1/2 flex-1 flex-col lg:flex-row">
      <div className="relative hidden shrink-0 overflow-hidden lg:block lg:w-[42%]">
        <Image
          src="/images/hero/hero-web.webp"
          alt="Kader posyandu membantu ibu memantau tumbuh kembang balita"
          fill
          priority
          sizes="42vw"
          className="object-cover"
        />
      </div>

      <div className="relative overflow-hidden lg:hidden">
        <Image
          src="/images/hero/hero-mobile.webp"
          alt="Kader posyandu membantu ibu memantau tumbuh kembang balita"
          width={1080}
          height={640}
          priority
          className="h-52 w-full object-cover object-[center_55%] sm:h-72"
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/brand/app-icon-192.png"
            alt="Logo PERIANG"
            width={56}
            height={56}
            className="size-14 rounded-2xl"
          />
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            PERIANG
          </h1>
          <p className="text-center text-sm text-zinc-500">
            Prediksi dan Analisis Balita Gizi Kurang
          </p>
        </div>

        <Card className="w-full max-w-sm border-zinc-100 shadow-sm dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Masuk</CardTitle>
            <CardDescription>
              Masuk sebagai kader posyandu untuk mengelola data gizi balita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
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

              <div className="flex flex-col gap-2">
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
          </CardContent>
        </Card>

        <div className="grid w-full max-w-sm grid-cols-3 gap-2">
          {LANGKAH.map((langkah) => (
            <div
              key={langkah.label}
              className="flex flex-col items-center gap-1.5"
            >
              <Image
                src={langkah.src}
                alt={langkah.label}
                width={80}
                height={80}
                className="size-16 rounded-xl object-cover sm:size-20"
              />
              <p className="text-center text-[11px] font-medium text-zinc-500">
                {langkah.label}
              </p>
            </div>
          ))}
        </div>

        <Image
          src="/images/banners/launch.webp"
          alt="PERIANG kini hadir untuk membantu kader posyandu memantau gizi balita"
          width={1080}
          height={1080}
          className="w-full max-w-sm rounded-2xl"
        />
      </div>
    </div>
  );
}
