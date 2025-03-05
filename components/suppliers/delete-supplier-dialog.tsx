"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSuppliers } from "@/lib/suppliers-context"
import { AlertTriangle } from "lucide-react"

interface DeleteSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId: number
}

export function DeleteSupplierDialog({ open, onOpenChange, supplierId }: DeleteSupplierDialogProps) {
  const { getSupplier, deleteSupplier } = useSuppliers()
  const [supplierName, setSupplierName] = useState("")

  useEffect(() => {
    if (open && supplierId) {
      const supplier = getSupplier(supplierId)
      if (supplier) {
        setSupplierName(supplier.name)
      }
    }
  }, [open, supplierId, getSupplier])

  const handleDelete = () => {
    deleteSupplier(supplierId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" /> Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            ¿Está seguro de que desea eliminar al proveedor <strong>{supplierName}</strong>? Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

