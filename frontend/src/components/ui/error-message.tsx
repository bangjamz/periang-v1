import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

/** Banner pesan kesalahan konsisten untuk semua respons API yang gagal. */
export function ErrorMessage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
        className,
      )}
    >
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="mt-0.5 size-3.5 shrink-0"
      />
      <p>{children}</p>
    </div>
  );
}
