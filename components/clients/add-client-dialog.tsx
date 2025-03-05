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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClients } from "@/lib/clients-context"

interface AddClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddClientDialog({ open, onOpenChange }: AddClientDialogProps) {
  const { addClient } = useClients()
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [identificacion, setIdentificacion] = useState("")
  const [tipoIdentificacion, setTipoIdentificacion] = useState("national-id")
  const [direccion, setDireccion] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addClient({
      nombre,
      apellido,
      identificacion,
      tipoIdentificacion,
      direccion,
      telefono,
      email,
    })
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setNombre("")
    setApellido("")
    setIdentificacion("")
    setTipoIdentificacion("national-id")
    setDireccion("")
    setTelefono("")
    setEmail("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Agregue un nuevo cliente a su sistema. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identificacion">Identificación</Label>
                <Input
                  id="identificacion"
                  value={identificacion}
                  onChange={(e) => setIdentificacion(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo-identificacion">Tipo Identificación</Label>
                <Select value={tipoIdentificacion} onValueChange={setTipoIdentificacion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national-id">Cédula Nacional</SelectItem>
                    <SelectItem value="passport">Pasaporte</SelectItem>
                    <SelectItem value="driver-license">Licencia de Conducir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-900 hover:bg-purple-800">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

