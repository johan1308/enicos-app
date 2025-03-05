"use client"

import type React from "react"

import { useState } from "react"
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

interface AddSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSupplierDialog({ open, onOpenChange }: AddSupplierDialogProps) {
  const { addSupplier } = useSuppliers()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [active, setActive] = useState(true)
  const [address, setAddress] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addSupplier({
      name,
      email,
      phone,
      active,
      address,
      contactPerson,
      notes,
    })
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setActive(true)
    setAddress("")
    setContactPerson("")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo proveedor</DialogTitle>
          <DialogDescription>
            Agregue un nuevo proveedor a su sistema. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-person">Persona de Contacto</Label>
              <Input id="contact-person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="active">Activo</Label>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-purple-900 hover:bg-purple-800">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

