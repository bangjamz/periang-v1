# Riwayat PRD PERIANG

Folder ini menyimpan setiap versi PRD (Product Requirements Document) yang
dikirim user, supaya perubahan antar versi bisa ditelusuri (traceback) —
tidak menimpa versi lama begitu saja.

## Cara pakai

1. Setiap kali user kirim PRD baru/revisi lewat chat, simpan **apa
   adanya** (tanpa diedit) ke file baru di folder ini:
   ```
   docs/prd/prd-v{N}-{YYYY-MM-DD}.md
   ```
   Contoh: `prd-v10-2026-08-20.md`.
2. Tambahkan 1 entri baru di [CHANGELOG.md](CHANGELOG.md) — ringkas apa
   yang berubah dibanding versi sebelumnya (fitur baru, fitur dihapus,
   perubahan arsitektur, dll), bukan salin ulang isi PRD.
3. Kalau perubahan itu memunculkan task baru yang belum ada di plan
   NgodingPakeAI, tambahkan ke [`../../backlog.md`](../../backlog.md)
   sebelum dikirim ke server.

## Daftar versi

| Versi | Tanggal | File | Ringkasan |
|-------|---------|------|-----------|
| v9 | (sebelum 2026-08-14) | *(belum diarsipkan — versi ini sudah berjalan di server NgodingPakeAI sebelum folder ini dibuat)* | 36 task Fase 4: Hubungkan Aplikasi ke Server, Huruf Ramah dan Angka Menonjol, Perbaiki Menu Bawah di HP, Pasang Gambar dan Maskot Aplikasi — semua **selesai** per 2026-08-14. |

> Versi v1-v9 sebelumnya belum tersimpan sebagai file terpisah di sini
> (folder ini baru dibuat 2026-08-14). Riwayat ringkas v1→v9 ada di
> [STATUS.md](../../STATUS.md) bagian "Catatan implementasi penting".
> Mulai versi berikutnya (v10 dst.), simpan filenya di sini apa adanya.
