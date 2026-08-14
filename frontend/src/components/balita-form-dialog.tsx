"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faPlus,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Balita, JenisKelamin } from "@/lib/dummy-data";
import { perbaruiBalita, tambahBalita } from "@/lib/balita-store";
import { cn } from "@/lib/utils";

type FormState = {
  nama: string;
  jenisKelamin: JenisKelamin | "";
  tanggalLahir: string;
  posyandu: string;
  beratLahir: string;
  tinggiLahir: string;
  alamat: string;
};

const KOSONG: FormState = {
  nama: "",
  jenisKelamin: "",
  tanggalLahir: "",
  posyandu: "",
  beratLahir: "",
  tinggiLahir: "",
  alamat: "",
};

function dariBalita(balita: Balita): FormState {
  return {
    nama: balita.nama,
    jenisKelamin: balita.jenisKelamin,
    tanggalLahir: balita.tanggalLahir,
    posyandu: balita.posyandu,
    beratLahir: balita.beratLahirKg?.toString() ?? "",
    tinggiLahir: balita.tinggiLahirCm?.toString() ?? "",
    alamat: balita.alamat ?? "",
  };
}

function hariIni() {
  return new Date().toISOString().slice(0, 10);
}

function validasi(form: FormState): Partial<Record<keyof FormState, string>> {
  const error: Partial<Record<keyof FormState, string>> = {};

  if (form.nama.trim().length < 2) {
    error.nama = "Nama minimal 2 karakter.";
  }
  if (form.jenisKelamin === "") {
    error.jenisKelamin = "Jenis kelamin wajib dipilih.";
  }
  if (!form.tanggalLahir) {
    error.tanggalLahir = "Tanggal lahir wajib diisi.";
  } else if (form.tanggalLahir > hariIni()) {
    error.tanggalLahir = "Tanggal lahir tidak boleh di masa depan.";
  }
  if (form.posyandu.trim().length < 2) {
    error.posyandu = "Nama posyandu wajib diisi.";
  }
  if (form.beratLahir !== "") {
    const berat = Number(form.beratLahir);
    if (Number.isNaN(berat) || berat < 0.5 || berat > 7) {
      error.beratLahir = "Berat lahir harus antara 0,5–7 kg.";
    }
  }
  if (form.tinggiLahir !== "") {
    const tinggi = Number(form.tinggiLahir);
    if (Number.isNaN(tinggi) || tinggi < 20 || tinggi > 65) {
      error.tinggiLahir = "Tinggi lahir harus antara 20–65 cm.";
    }
  }

  return error;
}

type BalitaFormDialogProps =
  { mode: "tambah"; balita?: undefined } | { mode: "ubah"; balita: Balita };

const TRIGGER_LABEL: Record<BalitaFormDialogProps["mode"], string> = {
  tambah: "Tambah Balita",
  ubah: "Ubah",
};

const TRIGGER_ICON: Record<BalitaFormDialogProps["mode"], IconDefinition> = {
  tambah: faPlus,
  ubah: faPen,
};

const JUDUL_DIALOG: Record<BalitaFormDialogProps["mode"], string> = {
  tambah: "Tambah Balita",
  ubah: "Ubah Data Balita",
};

const LABEL_SIMPAN: Record<BalitaFormDialogProps["mode"], string> = {
  tambah: "Simpan Balita",
  ubah: "Simpan Perubahan",
};

export function BalitaFormDialog({ mode, balita }: BalitaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(
    mode === "ubah" ? dariBalita(balita) : KOSONG,
  );
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
      setForm(mode === "ubah" ? dariBalita(balita) : KOSONG);
      setError({});
      setPesanGagal("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasilValidasi = validasi(form);
    setError(hasilValidasi);
    if (Object.keys(hasilValidasi).length > 0) return;

    const data = {
      nama: form.nama.trim(),
      jenisKelamin: form.jenisKelamin as JenisKelamin,
      tanggalLahir: form.tanggalLahir,
      posyandu: form.posyandu.trim(),
      beratLahirKg:
        form.beratLahir === "" ? undefined : Number(form.beratLahir),
      tinggiLahirCm:
        form.tinggiLahir === "" ? undefined : Number(form.tinggiLahir),
      alamat: form.alamat.trim() === "" ? undefined : form.alamat.trim(),
    };

    setMenyimpan(true);
    const hasil =
      mode === "ubah"
        ? await perbaruiBalita(balita.id, data)
        : await tambahBalita(data);
    setMenyimpan(false);

    if (!hasil.berhasil) {
      setPesanGagal(hasil.pesan);
      return;
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          mode === "tambah" ? (
            <Button className="bg-pink-500 hover:bg-pink-600" type="button" />
          ) : (
            <Button variant="outline" size="sm" type="button" />
          )
        }
      >
        <FontAwesomeIcon icon={TRIGGER_ICON[mode]} />
        {TRIGGER_LABEL[mode]}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{JUDUL_DIALOG[mode]}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`nama-${mode}`}>Nama Balita</Label>
            <Input
              id={`nama-${mode}`}
              placeholder="Nama lengkap balita"
              value={form.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
              aria-invalid={!!error.nama}
            />
            {error.nama && (
              <p className="text-xs text-rose-600">{error.nama}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`jenis-kelamin-${mode}`}>Jenis Kelamin</Label>
              <Select
                value={form.jenisKelamin}
                onValueChange={(v) =>
                  handleChange("jenisKelamin", v as JenisKelamin)
                }
              >
                <SelectTrigger
                  id={`jenis-kelamin-${mode}`}
                  className={cn(
                    "w-full",
                    error.jenisKelamin && "border-rose-500",
                  )}
                >
                  <SelectValue placeholder="Pilih">
                    {() =>
                      form.jenisKelamin === "L"
                        ? "Laki-laki"
                        : form.jenisKelamin === "P"
                          ? "Perempuan"
                          : "Pilih"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {error.jenisKelamin && (
                <p className="text-xs text-rose-600">{error.jenisKelamin}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={`tanggal-lahir-${mode}`}>Tanggal Lahir</Label>
              <Input
                id={`tanggal-lahir-${mode}`}
                type="date"
                max={hariIni()}
                value={form.tanggalLahir}
                onChange={(e) => handleChange("tanggalLahir", e.target.value)}
                aria-invalid={!!error.tanggalLahir}
              />
              {error.tanggalLahir && (
                <p className="text-xs text-rose-600">{error.tanggalLahir}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`posyandu-${mode}`}>Posyandu</Label>
            <Input
              id={`posyandu-${mode}`}
              placeholder="Nama posyandu"
              value={form.posyandu}
              onChange={(e) => handleChange("posyandu", e.target.value)}
              aria-invalid={!!error.posyandu}
            />
            {error.posyandu && (
              <p className="text-xs text-rose-600">{error.posyandu}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`berat-lahir-${mode}`}>Berat Lahir (kg)</Label>
              <Input
                id={`berat-lahir-${mode}`}
                type="number"
                step="0.1"
                placeholder="opsional"
                value={form.beratLahir}
                onChange={(e) => handleChange("beratLahir", e.target.value)}
                aria-invalid={!!error.beratLahir}
              />
              {error.beratLahir && (
                <p className="text-xs text-rose-600">{error.beratLahir}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`tinggi-lahir-${mode}`}>Tinggi Lahir (cm)</Label>
              <Input
                id={`tinggi-lahir-${mode}`}
                type="number"
                step="0.1"
                placeholder="opsional"
                value={form.tinggiLahir}
                onChange={(e) => handleChange("tinggiLahir", e.target.value)}
                aria-invalid={!!error.tinggiLahir}
              />
              {error.tinggiLahir && (
                <p className="text-xs text-rose-600">{error.tinggiLahir}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`alamat-${mode}`}>Alamat (opsional)</Label>
            <Input
              id={`alamat-${mode}`}
              placeholder="Alamat tempat tinggal"
              value={form.alamat}
              onChange={(e) => handleChange("alamat", e.target.value)}
            />
          </div>

          <ErrorMessage>{pesanGagal}</ErrorMessage>

          <DialogFooter className="-mx-4 -mb-4 sm:mx-0 sm:mb-0">
            <Button
              type="submit"
              disabled={menyimpan}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {menyimpan ? "Menyimpan..." : LABEL_SIMPAN[mode]}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
