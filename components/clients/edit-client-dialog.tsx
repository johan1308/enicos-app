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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClients } from "@/lib/clients-context"

interface EditClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: number
}

export function EditClientDialog({ open, onOpenChange, clientId }: EditClientDialogProps) {
  const { getClient, updateClient } = useClients()
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [identificacion, setIdentificacion] = useState("")
  const [tipoIdentificacion, setTipoIdentificacion] = useState("national-id")
  const [direccion, setDireccion] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")

  // Load client data when dialog opens
  useEffect(() => {
    if (open && clientId) {
      const client = getClient(clientId)
      if (client) {
        setNombre(client.nombre)
        setApellido(client.apellido)
        setIdentificacion(client.identificacion)
        setTipoIdentificacion(client.tipoIdentificacion)
        setDireccion(client.direccion || "")
        setTelefono(client.telefono || "")
        setEmail(client.email || "")
      }
    }
  }, [open, clientId, getClient])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateClient(clientId, {
      nombre,
      apellido,
      identificacion,
      tipoIdentificacion,
      direccion,
      telefono,
      email,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Modifique los detalles del cliente. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input id="edit-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apellido">Apellido</Label>
                <Input id="edit-apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-identificacion">Identificación</Label>
                <Input
                  id="edit-identificacion"
                  value={identificacion}
                  onChange={(e) => setIdentificacion(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tipo-identificacion">Tipo Identificación</Label>
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
              <Label htmlFor="edit-direccion">Dirección</Label>
              <Input id="edit-direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input id="edit-telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
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

