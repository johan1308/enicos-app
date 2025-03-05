"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, Pencil, Trash2, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useClients } from "@/lib/clients-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { EditClientDialog } from "@/components/clients/edit-client-dialog"
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog"
import { AddClientDialog } from "@/components/clients/add-client-dialog"

export default function ClientsPage() {
  const { clients } = useClients()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleEditClient = (id: number) => {
    setSelectedClientId(id)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClient = (id: number) => {
    setSelectedClientId(id)
    setIsDeleteDialogOpen(true)
  }

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${client.nombre} ${client.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-900 hover:bg-purple-800">
          <PlusIcon className="h-4 w-4 mr-2" /> Agregar Cliente
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar por nombre, identificación o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{`${client.nombre} ${client.apellido}`}</TableCell>
                  <TableCell>{client.identificacion}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {client.tipoIdentificacion === "national-id"
                        ? "Cédula"
                        : client.tipoIdentificacion === "passport"
                          ? "Pasaporte"
                          : "Licencia"}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.telefono || "-"}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>{client.direccion || "-"}</TableCell>
                  <TableCell>{format(new Date(client.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                  <TableCell>
                    {client.lastUpdated
                      ? format(new Date(client.lastUpdated), "dd/MM/yyyy HH:mm", { locale: es })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClient(client.id)}
                        title="Editar cliente"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClient(client.id)}
                        title="Eliminar cliente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddClientDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {selectedClientId && (
        <>
          <EditClientDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} clientId={selectedClientId} />
          <DeleteClientDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            clientId={selectedClientId}
          />
        </>
      )}

      <footer className="text-center text-xs text-muted-foreground mt-8">
        © 2025 ENICOS UNEXCA, Inc. Todos los derechos reservados.
      </footer>
    </div>
  )
}

