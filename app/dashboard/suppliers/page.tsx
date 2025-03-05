"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, Pencil, Trash2, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog"
import { EditSupplierDialog } from "@/components/suppliers/edit-supplier-dialog"
import { DeleteSupplierDialog } from "@/components/suppliers/delete-supplier-dialog"
import { useSuppliers } from "@/lib/suppliers-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function SuppliersPage() {
  const { suppliers, updateSupplier } = useSuppliers()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleEditSupplier = (id: number) => {
    setSelectedSupplierId(id)
    setIsEditDialogOpen(true)
  }

  const handleDeleteSupplier = (id: number) => {
    setSelectedSupplierId(id)
    setIsDeleteDialogOpen(true)
  }

  const toggleSupplierStatus = (id: number) => {
    const supplier = suppliers.find((s) => s.id === id)
    if (supplier) {
      updateSupplier(id, { active: !supplier.active })
    }
  }

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-900 hover:bg-purple-800">
          <PlusIcon className="h-4 w-4 mr-2" /> Nuevo proveedor
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Persona de Contacto</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No se encontraron proveedores
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.contactPerson || "-"}</TableCell>
                  <TableCell>{format(new Date(supplier.createdAt), "dd/MM/yyyy", { locale: es })}</TableCell>
                  <TableCell>
                    <Switch checked={supplier.active} onCheckedChange={() => toggleSupplierStatus(supplier.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSupplier(supplier.id)}
                        title="Editar proveedor"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        title="Eliminar proveedor"
                        className=" hover:bg-destructive"
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

      <AddSupplierDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {selectedSupplierId && (
        <>
          <EditSupplierDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            supplierId={selectedSupplierId}
          />
          <DeleteSupplierDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            supplierId={selectedSupplierId}
          />
        </>
      )}

      <footer className="text-center text-xs text-muted-foreground mt-8">
        © 2025 ENICOS UNEXCA, Inc. Todos los derechos reservados.
      </footer>
    </div>
  )
}

