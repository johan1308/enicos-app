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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useSuppliers } from "@/lib/suppliers-context"

interface EditSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId: number
}

export function EditSupplierDialog({ open, onOpenChange, supplierId }: EditSupplierDialogProps) {
  const { getSupplier, updateSupplier } = useSuppliers()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [active, setActive] = useState(true)
  const [address, setAddress] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [notes, setNotes] = useState("")

  // Load supplier data when dialog opens
  useEffect(() => {
    if (open && supplierId) {
      const supplier = getSupplier(supplierId)
      if (supplier) {
        setName(supplier.name)
        setEmail(supplier.email)
        setPhone(supplier.phone)
        setActive(supplier.active)
        setAddress(supplier.address || "")
        setContactPerson(supplier.contactPerson || "")
        setNotes(supplier.notes || "")
      }
    }
  }, [open, supplierId, getSupplier])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSupplier(supplierId, {
      name,
      email,
      phone,
      active,
      address,
      contactPerson,
      notes,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Proveedor</DialogTitle>
          <DialogDescription>
            Modifique los detalles del proveedor. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Correo</Label>
              <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contact-person">Persona de Contacto</Label>
              <Input
                id="edit-contact-person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notas</Label>
              <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-active">Activo</Label>
              <Switch id="edit-active" checked={active} onCheckedChange={setActive} />
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

