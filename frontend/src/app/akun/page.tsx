"use client";

import { useState, useSyncExternalStore } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFloppyDisk,
  faLock,
  faUser,
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
import { gantiKataSandi } from "@/lib/auth-store";
import {
  getKaderServerSnapshot,
  getKaderSnapshot,
  perbaruiKader,
  subscribeKader,
} from "@/lib/kader-store";

type FormState = {
  nama: string;
  posyandu: string;
};

function validasi(form: FormState): Partial<Record<keyof FormState, string>> {
  const error: Partial<Record<keyof FormState, string>> = {};

  if (form.nama.trim().length < 2) {
    error.nama = "Nama minimal 2 karakter.";
  }
  if (form.posyandu.trim().length < 2) {
    error.posyandu = "Nama posyandu wajib diisi.";
  }

  return error;
}

type FormKataSandi = {
  kataSandiLama: string;
  kataSandiBaru: string;
  konfirmasi: string;
};

const KOSONG_KATA_SANDI: FormKataSandi = {
  kataSandiLama: "",
  kataSandiBaru: "",
  konfirmasi: "",
};

function validasiKataSandi(
  form: FormKataSandi,
): Partial<Record<keyof FormKataSandi, string>> {
  const error: Partial<Record<keyof FormKataSandi, string>> = {};

  if (form.kataSandiLama === "") {
    error.kataSandiLama = "Kata sandi saat ini wajib diisi.";
  }
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

export default function AkunPage() {
  const kader = useSyncExternalStore(
    subscribeKader,
    getKaderSnapshot,
    getKaderServerSnapshot,
  );
  const [form, setForm] = useState<FormState>({
    nama: kader.nama,
    posyandu: kader.posyandu,
  });
  const [error, setError] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [tersimpan, setTersimpan] = useState(false);

  function handleChange<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTersimpan(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errorBaru = validasi(form);
    setError(errorBaru);
    if (Object.keys(errorBaru).length > 0) return;

    perbaruiKader({ nama: form.nama.trim(), posyandu: form.posyandu.trim() });
    setTersimpan(true);
  }

  const [formKataSandi, setFormKataSandi] =
    useState<FormKataSandi>(KOSONG_KATA_SANDI);
  const [errorKataSandi, setErrorKataSandi] = useState<
    Partial<Record<keyof FormKataSandi, string>>
  >({});
  const [pesanGagalKataSandi, setPesanGagalKataSandi] = useState("");
  const [kataSandiTersimpan, setKataSandiTersimpan] = useState(false);

  function handleChangeKataSandi<K extends keyof FormKataSandi>(
    key: K,
    value: string,
  ) {
    setFormKataSandi((prev) => ({ ...prev, [key]: value }));
    setPesanGagalKataSandi("");
    setKataSandiTersimpan(false);
  }

  function handleSubmitKataSandi(e: React.FormEvent) {
    e.preventDefault();
    const errorBaru = validasiKataSandi(formKataSandi);
    setErrorKataSandi(errorBaru);
    if (Object.keys(errorBaru).length > 0) return;

    const hasil = gantiKataSandi(
      formKataSandi.kataSandiLama,
      formKataSandi.kataSandiBaru,
    );

    if (!hasil.berhasil) {
      setPesanGagalKataSandi(hasil.pesan);
      return;
    }

    setFormKataSandi(KOSONG_KATA_SANDI);
    setKataSandiTersimpan(true);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-br from-slate-500 via-slate-400 to-zinc-400 px-4 py-8 text-white sm:rounded-b-3xl sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20">
            <FontAwesomeIcon icon={faUser} className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Profil Saya
            </h1>
            <p className="text-sm text-slate-50/90">
              Kelola data akun & posyandu Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-6 sm:px-8">
        <Card className="w-full max-w-lg border-slate-100 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Data Kader</CardTitle>
            <CardDescription>
              Nama dan posyandu ini ditampilkan di seluruh aplikasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  value={form.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  aria-invalid={!!error.nama}
                />
                {error.nama && (
                  <p className="text-xs text-rose-600">{error.nama}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="posyandu">Posyandu</Label>
                <Input
                  id="posyandu"
                  value={form.posyandu}
                  onChange={(e) => handleChange("posyandu", e.target.value)}
                  aria-invalid={!!error.posyandu}
                />
                {error.posyandu && (
                  <p className="text-xs text-rose-600">{error.posyandu}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={kader.email} disabled />
                <p className="text-xs text-zinc-400">
                  Email belum bisa diubah di versi ini.
                </p>
              </div>

              <Button
                type="submit"
                variant={tersimpan ? "secondary" : "default"}
                className={!tersimpan ? "bg-slate-500 hover:bg-slate-600" : ""}
              >
                <FontAwesomeIcon icon={tersimpan ? faCheck : faFloppyDisk} />
                {tersimpan ? "Tersimpan" : "Simpan Perubahan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 w-full max-w-lg border-slate-100 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faLock}
                className="size-4 text-slate-500"
              />
              Ganti Kata Sandi
            </CardTitle>
            <CardDescription>
              Gunakan kata sandi baru untuk masuk ke aplikasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmitKataSandi}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="kata-sandi-lama">Kata Sandi Saat Ini</Label>
                <Input
                  id="kata-sandi-lama"
                  type="password"
                  autoComplete="current-password"
                  value={formKataSandi.kataSandiLama}
                  onChange={(e) =>
                    handleChangeKataSandi("kataSandiLama", e.target.value)
                  }
                  aria-invalid={!!errorKataSandi.kataSandiLama}
                />
                {errorKataSandi.kataSandiLama && (
                  <p className="text-xs text-rose-600">
                    {errorKataSandi.kataSandiLama}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="kata-sandi-baru">Kata Sandi Baru</Label>
                <Input
                  id="kata-sandi-baru"
                  type="password"
                  autoComplete="new-password"
                  value={formKataSandi.kataSandiBaru}
                  onChange={(e) =>
                    handleChangeKataSandi("kataSandiBaru", e.target.value)
                  }
                  aria-invalid={!!errorKataSandi.kataSandiBaru}
                />
                {errorKataSandi.kataSandiBaru && (
                  <p className="text-xs text-rose-600">
                    {errorKataSandi.kataSandiBaru}
                  </p>
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
                  value={formKataSandi.konfirmasi}
                  onChange={(e) =>
                    handleChangeKataSandi("konfirmasi", e.target.value)
                  }
                  aria-invalid={!!errorKataSandi.konfirmasi}
                />
                {errorKataSandi.konfirmasi && (
                  <p className="text-xs text-rose-600">
                    {errorKataSandi.konfirmasi}
                  </p>
                )}
              </div>

              {pesanGagalKataSandi && (
                <p className="rounded-lg bg-rose-50 p-2.5 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {pesanGagalKataSandi}
                </p>
              )}

              <Button
                type="submit"
                variant={kataSandiTersimpan ? "secondary" : "default"}
                className={
                  !kataSandiTersimpan ? "bg-slate-500 hover:bg-slate-600" : ""
                }
              >
                <FontAwesomeIcon
                  icon={kataSandiTersimpan ? faCheck : faFloppyDisk}
                />
                {kataSandiTersimpan ? "Tersimpan" : "Simpan Kata Sandi"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
