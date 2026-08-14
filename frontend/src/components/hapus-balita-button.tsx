"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Balita } from "@/lib/dummy-data";
import { hapusBalita } from "@/lib/balita-store";
import { hapusRiwayatByBalitaLokal } from "@/lib/riwayat-store";

async function handleHapus(balitaId: string) {
  const hasil = await hapusBalita(balitaId);
  if (hasil.berhasil) {
    // Server sudah cascade-hapus riwayatnya; sinkronkan cache lokal.
    hapusRiwayatByBalitaLokal(balitaId);
  }
}

export function HapusBalitaButton({ balita }: { balita: Balita }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            type="button"
            className="text-zinc-400 hover:text-rose-600"
          />
        }
      >
        <FontAwesomeIcon icon={faTrash} className="size-3.5" />
        <span className="sr-only">Hapus {balita.nama}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus data balita?</AlertDialogTitle>
          <AlertDialogDescription>
            Data <strong>{balita.nama}</strong> beserta riwayat pemeriksaannya
            akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 hover:bg-rose-700"
            onClick={() => handleHapus(balita.id)}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
