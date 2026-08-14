import { cn } from "@/lib/utils";

/**
 * Angka penting (berat, tinggi, umur, skor) ditampilkan besar & tebal agar
 * cepat dibaca sekilas — dipakai di kartu hasil cek gizi, riwayat, grafik,
 * dan prediksi risiko.
 */
export function BigNumber({
  value,
  unit,
  label,
  className,
  valueClassName,
}: {
  value: string | number;
  unit?: string;
  label?: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      )}
      <span className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-3xl leading-none font-extrabold tracking-tight tabular-nums sm:text-4xl",
            valueClassName,
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * Kata kunci (label status gizi, tingkat risiko) ditampilkan besar, tebal,
 * dan mencolok agar informasi kategorikal utama langsung tertangkap mata.
 */
export function BigWord({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-2xl leading-tight font-extrabold tracking-tight uppercase sm:text-3xl",
        className,
      )}
    >
      {children}
    </p>
  );
}
