export function hitungUmurBulan(
  tanggalLahir: string,
  dariTanggal = new Date(),
): number {
  const lahir = new Date(tanggalLahir);
  let bulan =
    (dariTanggal.getFullYear() - lahir.getFullYear()) * 12 +
    (dariTanggal.getMonth() - lahir.getMonth());

  if (dariTanggal.getDate() < lahir.getDate()) {
    bulan -= 1;
  }

  return Math.max(bulan, 0);
}

export function formatUmur(umurBulan: number): string {
  const tahun = Math.floor(umurBulan / 12);
  const sisaBulan = umurBulan % 12;

  if (tahun === 0) return `${sisaBulan} bulan`;
  if (sisaBulan === 0) return `${tahun} tahun`;
  return `${tahun} tahun ${sisaBulan} bulan`;
}
