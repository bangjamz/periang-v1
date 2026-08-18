"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFloppyDisk,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
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
import {
  FaktorRisiko,
  FaktorRisikoModel,
  getFaktorRisikoByBalita,
  PendapatanKeluarga,
  RiwayatLahir,
  Sanitasi,
  simpanFaktorRisiko,
  StatusYaTidak,
  subscribeFaktorRisiko,
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

/**
 * Opsi berlabel untuk field yang kode SSGI-nya sudah dikonfirmasi dari
 * dokumen resmi (Kuesioner SSGI 2024 & "SSGI Dalam Angka 2024") — lihat
 * docs/champion-model-integration.md untuk sumber & catatan akurasi
 * (pendidikan/pekerjaan diturunkan dari kategori publikasi agregat SSGI,
 * bukan dari instrumen mentah — kemungkinan kecil beda urutan, verifikasi
 * ulang kalau kuesioner rumah tangga asli ditemukan).
 */
const OPSI_PENDIDIKAN = [
  { value: 1, label: "Tidak Sekolah" },
  { value: 2, label: "Tidak Tamat SD" },
  { value: 3, label: "Tamat SD" },
  { value: 4, label: "Tamat SLTP" },
  { value: 5, label: "Tamat SLTA" },
  { value: 6, label: "Tamat D1/D2/D3/PT" },
];

const OPSI_PEKERJAAN = [
  { value: 1, label: "Tidak Bekerja/Sekolah" },
  { value: 2, label: "PNS/TNI/Polri/BUMN/BUMD" },
  { value: 3, label: "Pegawai Swasta" },
  { value: 4, label: "Wiraswasta" },
  { value: 5, label: "Petani/Buruh Tani" },
  { value: 6, label: "Nelayan" },
  { value: 7, label: "Buruh/Sopir/Ojek/Pembantu" },
  { value: 8, label: "Lainnya" },
];

const OPSI_SUMBER_AIR = [
  { value: 1, label: "Ledeng Meteran (keran individual)" },
  { value: 2, label: "Ledeng Eceran" },
  { value: 3, label: "Keran Umum (komunal)" },
  { value: 4, label: "Hidran Umum" },
  { value: 5, label: "Terminal Air" },
  { value: 6, label: "Penampungan Air Hujan (PAH)" },
  { value: 7, label: "Sumur Bor/Pompa" },
  { value: 8, label: "Sumur Terlindung" },
  { value: 9, label: "Mata Air Terlindung" },
  { value: 10, label: "Air Kemasan Bermerk" },
  { value: 11, label: "Air Isi Ulang" },
  { value: 12, label: "Sumur Tak Terlindungi" },
  { value: 13, label: "Mata Air Tak Terlindungi" },
  { value: 14, label: "Air Permukaan" },
];

const OPSI_STATUS_IMUNISASI = [
  { value: 1, label: "Ya, ada catatan tanggal" },
  { value: 2, label: "Ya, tercatat tanpa tanggal" },
  { value: 3, label: "Ya, berdasarkan ingatan" },
  { value: 4, label: "Tidak diimunisasi" },
  { value: 7, label: "Belum waktunya" },
  { value: 8, label: "Tidak tahu" },
];

const OPSI_BUKU_KIA = [
  { value: 1, label: "Ya, terisi lengkap" },
  { value: 2, label: "Ya, terisi tidak lengkap" },
  { value: 3, label: "Ada, tidak terisi" },
  { value: 4, label: "Tidak punya" },
];

/**
 * 16 field granular untuk champion model ML. Field dengan `options`
 * ditampilkan sebagai dropdown berlabel (kode SSGI-nya sudah dikonfirmasi).
 * `kode: true` = kode SSGI belum dikonfirmasi dari dokumen resmi — masih
 * input angka mentah sampai sumbernya ditemukan.
 */
const FIELD_MODEL: {
  key: keyof FaktorRisikoModel;
  label: string;
  kode?: boolean;
  unit?: string;
  min?: number;
  max?: number;
  options?: { value: number; label: string }[];
}[] = [
  {
    key: "usiaKandunganMinggu",
    label: "Usia Kandungan Saat Lahir",
    unit: "minggu",
    min: 20,
    max: 45,
  },
  { key: "jumlahArt", label: "Jumlah Anggota Rumah Tangga", min: 1, max: 50 },
  {
    key: "jumlahBalitaRt",
    label: "Jumlah Balita dalam Rumah Tangga",
    min: 1,
    max: 20,
  },
  { key: "pekerjaanAyah", label: "Pekerjaan Ayah", options: OPSI_PEKERJAAN },
  { key: "pekerjaanIbu", label: "Pekerjaan Ibu", options: OPSI_PEKERJAAN },
  {
    key: "pendidikanAyah",
    label: "Pendidikan Ayah",
    options: OPSI_PENDIDIKAN,
  },
  { key: "pendidikanIbu", label: "Pendidikan Ibu", options: OPSI_PENDIDIKAN },
  { key: "kepemilikanJamban", label: "Kepemilikan Jamban", kode: true },
  {
    key: "sumberAirMinum",
    label: "Sumber Air Minum",
    options: OPSI_SUMBER_AIR,
  },
  { key: "lokasiAirMinum", label: "Lokasi Sumber Air Minum", kode: true },
  {
    key: "pembuanganLimbahCair",
    label: "Pembuangan Limbah Cair",
    kode: true,
  },
  { key: "pembuanganTinja", label: "Pembuangan Tinja", kode: true },
  {
    key: "kepemilikanBukuKia",
    label: "Kepemilikan Buku KIA",
    options: OPSI_BUKU_KIA,
  },
  {
    key: "imunisasiHb0",
    label: "Imunisasi Hepatitis B0",
    options: OPSI_STATUS_IMUNISASI,
  },
  {
    key: "imunisasiBcg",
    label: "Imunisasi BCG",
    options: OPSI_STATUS_IMUNISASI,
  },
  {
    key: "imunisasiDptHbHibLanjutan",
    label: "Imunisasi DPT-HB-Hib Lanjutan",
    options: OPSI_STATUS_IMUNISASI,
  },
];

export function FaktorRisikoForm({
  balitaId,
  onSaved,
}: {
  balitaId: string;
  onSaved?: (data: FaktorRisiko) => void;
}) {
  const existing = useSyncExternalStore(
    subscribeFaktorRisiko,
    () => getFaktorRisikoByBalita(balitaId),
    () => null,
  );

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
  const [model, setModel] = useState<FaktorRisikoModel>(existing ?? {});
  const [tersimpan, setTersimpan] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesanGagal, setPesanGagal] = useState("");

  // Data faktor risiko dimuat async dari server; sinkronkan form saat siap.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!existing) return;
    setRiwayatLahir(existing.riwayatLahir);
    setImunisasi(existing.imunisasi);
    setAsiEksklusif(existing.asiEksklusif);
    setSanitasi(existing.sanitasi);
    setPendapatanKeluarga(existing.pendapatanKeluarga ?? "");
    setModel(existing);
  }, [existing]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const valid =
    riwayatLahir !== "" &&
    imunisasi !== "" &&
    asiEksklusif !== "" &&
    sanitasi !== "";

  function handleChangeModel(key: keyof FaktorRisikoModel, raw: string) {
    setModel((prev) => ({
      ...prev,
      [key]: raw === "" ? undefined : Number(raw),
    }));
    setTersimpan(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;

    setMenyimpan(true);
    const hasil = await simpanFaktorRisiko({
      balitaId,
      riwayatLahir: riwayatLahir as RiwayatLahir,
      imunisasi: imunisasi as StatusYaTidak,
      asiEksklusif: asiEksklusif as StatusYaTidak,
      sanitasi: sanitasi as Sanitasi,
      pendapatanKeluarga: pendapatanKeluarga || undefined,
      ...model,
    });
    setMenyimpan(false);

    if (!hasil.berhasil) {
      setPesanGagal(hasil.pesan);
      return;
    }

    setTersimpan(true);
    onSaved?.(hasil.data);
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

      <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
        <div className="flex items-start gap-2">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="mt-0.5 size-3.5 shrink-0 text-amber-500"
          />
          <div>
            <p className="text-sm font-semibold">
              Data untuk Model Prediksi ML (opsional)
            </p>
            <p className="text-xs text-zinc-500">
              Semua boleh dikosongkan (diisi bertahap) — makin lengkap, makin
              akurat hasil prediksi risiko. Field bertanda{" "}
              <span className="font-medium">kode</span> memakai kode kuesioner
              SSGI mentah (belum ada label karena buku kode resmi belum
              tersedia).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FIELD_MODEL.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <Label htmlFor={`model-${f.key}`} className="text-xs">
                {f.label}
                {f.kode && <span className="ml-1 text-zinc-400">(kode)</span>}
              </Label>
              {f.options ? (
                <Select
                  value={model[f.key]?.toString() ?? ""}
                  onValueChange={(v) => handleChangeModel(f.key, v ?? "")}
                >
                  <SelectTrigger id={`model-${f.key}`} className="w-full">
                    <SelectValue placeholder="Pilih">
                      {() =>
                        f.options!.find((o) => o.value === model[f.key])
                          ?.label ?? "Pilih"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value.toString()}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="relative">
                  <Input
                    id={`model-${f.key}`}
                    type="number"
                    inputMode="numeric"
                    min={f.min ?? 0}
                    max={f.max ?? 20}
                    placeholder={f.kode ? "Kode" : "-"}
                    value={model[f.key] ?? ""}
                    onChange={(e) => handleChangeModel(f.key, e.target.value)}
                    className={f.unit ? "pr-14" : undefined}
                  />
                  {f.unit && (
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-zinc-400">
                      {f.unit}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ErrorMessage>{pesanGagal}</ErrorMessage>

      <Button
        type="submit"
        disabled={!valid || menyimpan}
        variant={tersimpan ? "secondary" : "default"}
        className={!tersimpan ? "bg-violet-500 hover:bg-violet-600" : ""}
      >
        <FontAwesomeIcon icon={tersimpan ? faCheck : faFloppyDisk} />
        {tersimpan
          ? "Tersimpan"
          : menyimpan
            ? "Menyimpan..."
            : "Simpan Faktor Risiko"}
      </Button>
    </form>
  );
}
