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
import { useClients } from "@/lib/clients-context"
import { AlertTriangle } from "lucide-react"

interface DeleteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: number
}

export function DeleteClientDialog({ open, onOpenChange, clientId }: DeleteClientDialogProps) {
  const { getClient, deleteClient } = useClients()
  const [clientName, setClientName] = useState("")

  useEffect(() => {
    if (open && clientId) {
      const client = getClient(clientId)
      if (client) {
        setClientName(`${client.nombre} ${client.apellido}`)
      }
    }
  }, [open, clientId, getClient])

  const handleDelete = () => {
    deleteClient(clientId)
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
            ¿Está seguro de que desea eliminar al cliente <strong>{clientName}</strong>? Esta acción no se puede
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

