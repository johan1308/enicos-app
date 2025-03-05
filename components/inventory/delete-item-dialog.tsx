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
import { useInventory } from "@/lib/inventory-context"
import { AlertTriangle } from "lucide-react"

interface DeleteItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: number
}

export function DeleteItemDialog({ open, onOpenChange, itemId }: DeleteItemDialogProps) {
  const { getItem, deleteItem } = useInventory()
  const [itemName, setItemName] = useState("")

  useEffect(() => {
    if (open && itemId) {
      const item = getItem(itemId)
      if (item) {
        setItemName(item.name)
      }
    }
  }, [open, itemId, getItem])

  const handleDelete = () => {
    deleteItem(itemId)
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
            ¿Está seguro de que desea eliminar el producto <strong>{itemName}</strong>? Esta acción no se puede
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

