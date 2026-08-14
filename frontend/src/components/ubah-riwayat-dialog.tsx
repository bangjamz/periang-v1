"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Balita } from "@/lib/dummy-data";
import { perbaruiRiwayatCek, type RiwayatCek } from "@/lib/riwayat-store";

function hariIni() {
  return new Date().toISOString().slice(0, 10);
}

type FormState = {
  tanggalCek: string;
  beratKg: string;
  tinggiCm: string;
  catatan: string;
};

function validasi(
  form: FormState,
  balita: Balita | null,
): Partial<Record<keyof FormState, string>> {
  const error: Partial<Record<keyof FormState, string>> = {};

  if (!form.tanggalCek) {
    error.tanggalCek = "Tanggal pemeriksaan wajib diisi.";
  } else if (form.tanggalCek > hariIni()) {
    error.tanggalCek = "Tanggal pemeriksaan tidak boleh di masa depan.";
  } else if (balita && form.tanggalCek < balita.tanggalLahir) {
    error.tanggalCek = "Tanggal pemeriksaan tidak boleh sebelum tanggal lahir.";
  }

  const berat = Number(form.beratKg);
  if (form.beratKg === "" || Number.isNaN(berat) || berat < 0.5 || berat > 50) {
    error.beratKg = "Berat badan harus antara 0,5–50 kg.";
  }

  const tinggi = Number(form.tinggiCm);
  if (
    form.tinggiCm === "" ||
    Number.isNaN(tinggi) ||
    tinggi < 20 ||
    tinggi > 150
  ) {
    error.tinggiCm = "Tinggi badan harus antara 20–150 cm.";
  }

  return error;
}

export function UbahRiwayatDialog({
  entry,
  balita,
}: {
  entry: RiwayatCek;
  balita: Balita | null;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    tanggalCek: entry.tanggalCek,
    beratKg: entry.beratKg.toString(),
    tinggiCm: entry.tinggiCm.toString(),
    catatan: entry.catatan ?? "",
  });
  const [error, setError] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [pesanGagal, setPesanGagal] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setForm({
        tanggalCek: entry.tanggalCek,
        beratKg: entry.beratKg.toString(),
        tinggiCm: entry.tinggiCm.toString(),
        catatan: entry.catatan ?? "",
      });
      setError({});
      setPesanGagal("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasilValidasi = validasi(form, balita);
    setError(hasilValidasi);
    if (Object.keys(hasilValidasi).length > 0) return;

    setMenyimpan(true);
    const hasil = await perbaruiRiwayatCek(entry.id, {
      tanggalCek: form.tanggalCek,
      beratKg: Number(form.beratKg),
      tinggiCm: Number(form.tinggiCm),
      catatan: form.catatan.trim() === "" ? undefined : form.catatan.trim(),
    });
    setMenyimpan(false);

    if (!hasil.berhasil) {
      setPesanGagal(hasil.pesan);
      return;
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" type="button" />}>
        <FontAwesomeIcon icon={faPen} />
        Ubah Data Pemeriksaan
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Data Pemeriksaan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ubah-tanggal-cek">Tanggal Pemeriksaan</Label>
            <Input
              id="ubah-tanggal-cek"
              type="date"
              max={hariIni()}
              value={form.tanggalCek}
              onChange={(e) => handleChange("tanggalCek", e.target.value)}
              aria-invalid={!!error.tanggalCek}
            />
            {error.tanggalCek && (
              <p className="text-xs text-rose-600">{error.tanggalCek}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ubah-berat">Berat (kg)</Label>
              <Input
                id="ubah-berat"
                type="number"
                step="0.1"
                value={form.beratKg}
                onChange={(e) => handleChange("beratKg", e.target.value)}
                aria-invalid={!!error.beratKg}
              />
              {error.beratKg && (
                <p className="text-xs text-rose-600">{error.beratKg}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ubah-tinggi">Tinggi (cm)</Label>
              <Input
                id="ubah-tinggi"
                type="number"
                step="0.1"
                value={form.tinggiCm}
                onChange={(e) => handleChange("tinggiCm", e.target.value)}
                aria-invalid={!!error.tinggiCm}
              />
              {error.tinggiCm && (
                <p className="text-xs text-rose-600">{error.tinggiCm}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ubah-catatan">Catatan (opsional)</Label>
            <Input
              id="ubah-catatan"
              placeholder="Catatan tambahan..."
              value={form.catatan}
              onChange={(e) => handleChange("catatan", e.target.value)}
            />
          </div>

          <p className="text-xs text-zinc-400">
            Status gizi akan dihitung ulang otomatis dari data baru ini.
          </p>

          <ErrorMessage>{pesanGagal}</ErrorMessage>

          <DialogFooter className="-mx-4 -mb-4 sm:mx-0 sm:mb-0">
            <Button
              type="submit"
              disabled={menyimpan}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {menyimpan ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
