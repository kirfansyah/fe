"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function StepConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
}) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title || "Konfirmasi"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Apakah Anda yakin ingin melanjutkan ke langkah berikutnya?
        </p>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Batal
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-blue-600 text-white">
            Lanjut
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
