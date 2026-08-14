export type TourStep = {
  id: string;
  /** CSS selector target untuk spotlight. Kosong = langkah tanpa target (di tengah layar). */
  selector?: string;
  title: string;
  body: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "sambutan",
    title: "Selamat datang di PERIANG! 👋",
    body: "Aplikasi ini membantu kader posyandu mencatat & memeriksa status gizi balita dengan cepat dan akurat. Yuk kenalan sebentar dengan menu-menu utamanya.",
  },
  {
    id: "nav-cek-gizi",
    selector: '[data-tour="nav-cek-status-gizi"]',
    title: "Cek Status Gizi",
    body: "Menu utama untuk memeriksa berat & tinggi balita — hasilnya langsung dihitung otomatis sesuai standar WHO.",
  },
  {
    id: "nav-balita",
    selector: '[data-tour="nav-balita"]',
    title: "Data Balita",
    body: "Kelola semua data balita di posyandu kamu: tambah, ubah, atau cari data balita di sini.",
  },
  {
    id: "nav-riwayat",
    selector: '[data-tour="nav-riwayat"]',
    title: "Riwayat Pemeriksaan",
    body: "Semua hasil cek status gizi tersimpan di sini, dikelompokkan per balita, supaya mudah dipantau dari waktu ke waktu.",
  },
  {
    id: "nav-grafik",
    selector: '[data-tour="nav-grafik"]',
    title: "Grafik Pertumbuhan",
    body: "Lihat tren berat & tinggi badan balita dalam bentuk grafik supaya lebih mudah dipahami.",
  },
  {
    id: "nav-prediksi",
    selector: '[data-tour="nav-prediksi"]',
    title: "Prediksi Risiko",
    body: "Isi faktor risiko balita (riwayat lahir, imunisasi, sanitasi, dll) untuk memperkirakan risiko gizi kurang sejak dini.",
  },
  {
    id: "cek-gizi-mulai",
    selector: '[data-tour="cek-gizi-balita-picker"]',
    title: "Mulai dari Sini",
    body: "Pilih balita yang ingin diperiksa, lalu isi berat & tinggi badannya untuk melihat hasil status gizinya.",
  },
  {
    id: "profil",
    selector: '[data-tour="kader-chip"]',
    title: "Profil Kamu",
    body: "Lihat profil, ganti kata sandi, atau keluar dari akun lewat menu ini.",
  },
  {
    id: "penutup",
    title: "Siap Mulai! 🎉",
    body: 'Kamu sudah siap menggunakan PERIANG. Kalau butuh panduan ini lagi, buka halaman Akun Saya dan tekan "Mulai Tour Lagi".',
  },
];
