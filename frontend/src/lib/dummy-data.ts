export type JenisKelamin = "L" | "P";

export type Balita = {
  id: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  posyandu: string;
};

export const DUMMY_BALITA: Balita[] = [
  {
    id: "1",
    nama: "Ahmad Fauzi",
    jenisKelamin: "L",
    tanggalLahir: "2024-03-12",
    posyandu: "Posyandu Melati 1",
  },
  {
    id: "2",
    nama: "Siti Aisyah",
    jenisKelamin: "P",
    tanggalLahir: "2023-11-05",
    posyandu: "Posyandu Melati 1",
  },
  {
    id: "3",
    nama: "Budi Santoso",
    jenisKelamin: "L",
    tanggalLahir: "2024-07-20",
    posyandu: "Posyandu Melati 1",
  },
  {
    id: "4",
    nama: "Nur Halimah",
    jenisKelamin: "P",
    tanggalLahir: "2022-09-01",
    posyandu: "Posyandu Melati 1",
  },
  {
    id: "5",
    nama: "Rizky Ramadhan",
    jenisKelamin: "L",
    tanggalLahir: "2023-04-18",
    posyandu: "Posyandu Melati 1",
  },
  {
    id: "6",
    nama: "Putri Ayu Lestari",
    jenisKelamin: "P",
    tanggalLahir: "2024-01-25",
    posyandu: "Posyandu Melati 2",
  },
  {
    id: "7",
    nama: "Dimas Prasetyo",
    jenisKelamin: "L",
    tanggalLahir: "2023-08-09",
    posyandu: "Posyandu Melati 2",
  },
  {
    id: "8",
    nama: "Zahra Salsabila",
    jenisKelamin: "P",
    tanggalLahir: "2024-05-30",
    posyandu: "Posyandu Melati 2",
  },
];

export type StatusGizi = "normal" | "kurang" | "buruk" | "pendek";

export const STATUS_GIZI_LABEL: Record<StatusGizi, string> = {
  normal: "Normal",
  kurang: "Gizi Kurang",
  buruk: "Gizi Buruk",
  pendek: "Stunting (Pendek)",
};

export const STATUS_GIZI_DESKRIPSI: Record<StatusGizi, string> = {
  normal: "Berat dan tinggi badan balita sesuai dengan standar umur.",
  kurang:
    "Berat badan balita di bawah standar umur. Perlu pemantauan lebih rutin.",
  buruk:
    "Berat badan balita jauh di bawah standar umur. Segera rujuk ke tenaga kesehatan.",
  pendek: "Tinggi badan balita di bawah standar umur. Waspada risiko stunting.",
};

export const STATUS_GIZI_CATATAN: Record<StatusGizi, string> = {
  normal: "Lanjutkan pola makan bergizi seimbang dan cek rutin tiap bulan.",
  kurang:
    "Tingkatkan asupan gizi harian dan pantau berat badan lebih sering bulan depan.",
  buruk: "Rujuk ke Puskesmas/tenaga kesehatan terdekat secepatnya.",
  pendek: "Konsultasikan ke tenaga kesehatan untuk penanganan risiko stunting.",
};
