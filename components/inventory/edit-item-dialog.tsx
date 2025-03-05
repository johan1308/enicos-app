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

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: number
}

export function EditItemDialog({ open, onOpenChange, itemId }: EditItemDialogProps) {
  const { getItem, updateItem } = useInventory()
  const { suppliers } = useSuppliers()
  const [name, setName] = useState("")
  const [value, setValue] = useState("")
  const [quantity, setQuantity] = useState("")
  const [status, setStatus] = useState("Activo")
  const [transactionType, setTransactionType] = useState("Compra")
  const [supplierId, setSupplierId] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [sku, setSku] = useState("")

  // Load item data when dialog opens
  useEffect(() => {
    if (open && itemId) {
      const item = getItem(itemId)
      if (item) {
        setName(item.name)
        setValue(item.value.toString())
        setQuantity(item.quantity.toString())
        setStatus(item.status)
        setTransactionType(item.transactionType)
        setSupplierId(item.supplierId.toString())
        setLocation(item.location || "")
        setDescription(item.description || "")
        setCategory(item.category || "")
        setSku(item.sku || "")
      }
    }
  }, [open, itemId, getItem])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateItem(itemId, {
      name,
      value: Number.parseFloat(value),
      quantity: Number.parseInt(quantity),
      status,
      transactionType,
      supplierId: Number.parseInt(supplierId),
      location,
      description,
      category,
      sku,
    })
    onOpenChange(false)
  }

  // Filtrar solo proveedores activos
  const activeSuppliers = suppliers.filter((supplier) => supplier.active)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifique los detalles del producto. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input id="edit-sku" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-value">Valor</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Cantidad</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                    <SelectItem value="Agotado">Agotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-transaction-type">Tipo de Transacción</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compra">Compra</SelectItem>
                    <SelectItem value="Venta">Venta</SelectItem>
                    <SelectItem value="Devolución">Devolución</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier-id">Proveedor</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Ubicación</Label>
              <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-900 hover:bg-purple-800">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

