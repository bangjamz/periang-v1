"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FaktorRisiko,
  getFaktorRisikoByBalita,
  PendapatanKeluarga,
  RiwayatLahir,
  Sanitasi,
  simpanFaktorRisiko,
  StatusYaTidak,
} from "@/lib/faktor-risiko-store";

const LABEL_RIWAYAT_LAHIR: Record<RiwayatLahir, string> = {
  normal: "Normal",
  prematur: "Prematur",
  berat_lahir_rendah: "Berat Lahir Rendah",
};

const LABEL_IMUNISASI: Record<StatusYaTidak, string> = {
  ya: "Lengkap",
  tidak: "Tidak Lengkap",
};

const LABEL_ASI: Record<StatusYaTidak, string> = {
  ya: "Ya",
  tidak: "Tidak",
};

const LABEL_SANITASI: Record<Sanitasi, string> = {
  baik: "Baik",
  kurang_baik: "Kurang Baik",
};

const LABEL_PENDAPATAN: Record<PendapatanKeluarga, string> = {
  rendah: "Rendah",
  cukup: "Cukup",
  tinggi: "Tinggi",
};

function bikinSelect<T extends string>(
  label: LabelMap<T>,
): { value: T; label: string }[] {
  return Object.entries(label).map(([value, l]) => ({
    value: value as T,
    label: l as string,
  }));
}

type LabelMap<T extends string> = Record<T, string>;

export function FaktorRisikoForm({
  balitaId,
  onSaved,
}: {
  balitaId: string;
  onSaved?: (data: FaktorRisiko) => void;
}) {
  const existing = getFaktorRisikoByBalita(balitaId);

  const [riwayatLahir, setRiwayatLahir] = useState<RiwayatLahir | "">(
    existing?.riwayatLahir ?? "",
  );
  const [imunisasi, setImunisasi] = useState<StatusYaTidak | "">(
    existing?.imunisasi ?? "",
  );
  const [asiEksklusif, setAsiEksklusif] = useState<StatusYaTidak | "">(
    existing?.asiEksklusif ?? "",
  );
  const [sanitasi, setSanitasi] = useState<Sanitasi | "">(
    existing?.sanitasi ?? "",
  );
  const [pendapatanKeluarga, setPendapatanKeluarga] = useState<
    PendapatanKeluarga | ""
  >(existing?.pendapatanKeluarga ?? "");
  const [tersimpan, setTersimpan] = useState(false);

  const valid =
    riwayatLahir !== "" &&
    imunisasi !== "" &&
    asiEksklusif !== "" &&
    sanitasi !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;

    const data = simpanFaktorRisiko({
      balitaId,
      riwayatLahir: riwayatLahir as RiwayatLahir,
      imunisasi: imunisasi as StatusYaTidak,
      asiEksklusif: asiEksklusif as StatusYaTidak,
      sanitasi: sanitasi as Sanitasi,
      pendapatanKeluarga: pendapatanKeluarga || undefined,
    });

    setTersimpan(true);
    onSaved?.(data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="riwayat-lahir">Riwayat Lahir</Label>
          <Select
            value={riwayatLahir}
            onValueChange={(v) => {
              setRiwayatLahir(v as RiwayatLahir);
              setTersimpan(false);
            }}
          >
            <SelectTrigger id="riwayat-lahir" className="w-full">
              <SelectValue placeholder="Pilih">
                {() =>
                  riwayatLahir === ""
                    ? "Pilih"
                    : LABEL_RIWAYAT_LAHIR[riwayatLahir]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bikinSelect(LABEL_RIWAYAT_LAHIR).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="imunisasi">Imunisasi</Label>
          <Select
            value={imunisasi}
            onValueChange={(v) => {
              setImunisasi(v as StatusYaTidak);
              setTersimpan(false);
            }}
          >
            <SelectTrigger id="imunisasi" className="w-full">
              <SelectValue placeholder="Pilih">
                {() =>
                  imunisasi === "" ? "Pilih" : LABEL_IMUNISASI[imunisasi]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bikinSelect(LABEL_IMUNISASI).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="asi-eksklusif">ASI Eksklusif</Label>
          <Select
            value={asiEksklusif}
            onValueChange={(v) => {
              setAsiEksklusif(v as StatusYaTidak);
              setTersimpan(false);
            }}
          >
            <SelectTrigger id="asi-eksklusif" className="w-full">
              <SelectValue placeholder="Pilih">
                {() =>
                  asiEksklusif === "" ? "Pilih" : LABEL_ASI[asiEksklusif]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bikinSelect(LABEL_ASI).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="sanitasi">Sanitasi</Label>
          <Select
            value={sanitasi}
            onValueChange={(v) => {
              setSanitasi(v as Sanitasi);
              setTersimpan(false);
            }}
          >
            <SelectTrigger id="sanitasi" className="w-full">
              <SelectValue placeholder="Pilih">
                {() => (sanitasi === "" ? "Pilih" : LABEL_SANITASI[sanitasi])}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bikinSelect(LABEL_SANITASI).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="pendapatan">Pendapatan Keluarga (opsional)</Label>
          <Select
            value={pendapatanKeluarga}
            onValueChange={(v) => {
              setPendapatanKeluarga(v as PendapatanKeluarga);
              setTersimpan(false);
            }}
          >
            <SelectTrigger id="pendapatan" className="w-full">
              <SelectValue placeholder="Tidak diisi">
                {() =>
                  pendapatanKeluarga === ""
                    ? "Tidak diisi"
                    : LABEL_PENDAPATAN[pendapatanKeluarga]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bikinSelect(LABEL_PENDAPATAN).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!valid}
        variant={tersimpan ? "secondary" : "default"}
        className={!tersimpan ? "bg-violet-500 hover:bg-violet-600" : ""}
      >
        <FontAwesomeIcon icon={tersimpan ? faCheck : faFloppyDisk} />
        {tersimpan ? "Tersimpan" : "Simpan Faktor Risiko"}
      </Button>
    </form>
  );
}
