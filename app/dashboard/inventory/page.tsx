"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon, Pencil, Trash2, Search, Eye, PackagePlus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AddItemDialog } from "@/components/inventory/add-item-dialog"
import { EditItemDialog } from "@/components/inventory/edit-item-dialog"
import { DeleteItemDialog } from "@/components/inventory/delete-item-dialog"
import { ViewItemDialog } from "@/components/inventory/view-item-dialog"
import { AddStockDialog } from "@/components/inventory/add-stock-dialog"
import { useInventory } from "@/lib/inventory-context"
import { formatNumber } from "@/lib/utils"

export default function InventoryPage() {
  const { inventory } = useInventory()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleEditItem = (id: number) => {
    setSelectedItemId(id)
    setIsEditDialogOpen(true)
  }

  const handleDeleteItem = (id: number) => {
    setSelectedItemId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleViewItem = (id: number) => {
    setSelectedItemId(id)
    setIsViewDialogOpen(true)
  }

  const handleAddStock = (id: number) => {
    setSelectedItemId(id)
    setIsAddStockDialogOpen(true)
  }

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-900 hover:bg-purple-800">
          <PlusIcon className="h-4 w-4 mr-2" /> Agregar Producto
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar por nombre, SKU o categoría..."
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
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  No se encontraron productos en el inventario
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku || "-"}</TableCell>
                  <TableCell>{item.category || "-"}</TableCell>
                  <TableCell>${formatNumber(item.value)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === "Activo"
                          ? "bg-green-600"
                          : item.status === "Inactivo"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewItem(item.id)}
                        title="Ver detalles"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddStock(item.id)}
                        title="Añadir stock"
                        className="text-green-500 hover:text-green-700"
                      >
                        <PackagePlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditItem(item.id)}
                        title="Editar producto"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Eliminar producto"
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

      <AddItemDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {selectedItemId && (
        <>
          <EditItemDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} itemId={selectedItemId} />
          <DeleteItemDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} itemId={selectedItemId} />
          <ViewItemDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} itemId={selectedItemId} />
          <AddStockDialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen} itemId={selectedItemId} />
        </>
      )}

      <footer className="text-center text-xs text-muted-foreground mt-8">
        © 2025 ENICOS UNEXCA, Inc. Todos los derechos reservados.
      </footer>
    </div>
  )
}

