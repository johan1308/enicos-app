"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInventory } from "@/lib/inventory-context"
import { useSuppliers } from "@/lib/suppliers-context"

interface AddStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: number
}

export function AddStockDialog({ open, onOpenChange, itemId }: AddStockDialogProps) {
  const { getItem, addStock } = useInventory()
  const { suppliers } = useSuppliers()
  const [item, setItem] = useState<any>(null)
  const [quantity, setQuantity] = useState("1")
  const [supplierId, setSupplierId] = useState("")
  const [notes, setNotes] = useState("")

  // Load item data when dialog opens
  useEffect(() => {
    if (open && itemId) {
      const inventoryItem = getItem(itemId)
      if (inventoryItem) {
        setItem(inventoryItem)
        setSupplierId(inventoryItem.supplierId.toString())
      }
    }
  }, [open, itemId, getItem])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const quantityNum = Number.parseInt(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return // Validación básica
    }

    addStock(itemId, quantityNum, Number.parseInt(supplierId), notes)

    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setQuantity("1")
    setNotes("")
  }

  // Filtrar solo proveedores activos
  const activeSuppliers = suppliers.filter((supplier) => supplier.active)

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir Stock a {item.name}</DialogTitle>
          <DialogDescription>Agregue más unidades al inventario de este producto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-quantity">Cantidad Actual</Label>
                <Input id="current-quantity" value={item.quantity} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-quantity">Cantidad a Añadir</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-id">Proveedor</Label>
              <Select value={supplierId} onValueChange={setSupplierId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {activeSuppliers.length === 0 ? (
                    <SelectItem value="" disabled>
                      No hay proveedores activos
                    </SelectItem>
                  ) : (
                    activeSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles adicionales sobre esta adición de stock"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Añadir Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

