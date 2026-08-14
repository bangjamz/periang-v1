import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <FontAwesomeIcon
      icon={faSpinner}
      className={cn("animate-spin text-zinc-400", className)}
      aria-hidden="true"
    />
  );
}

export function IndikatorMemuat({
  label = "Memuat data...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-10 text-center",
        className,
      )}
    >
      <Spinner className="size-6" />
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}
