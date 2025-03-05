"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSales, type ProductItem, type Client } from "@/lib/sales-context"

interface ClientInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientInfoDialog({ open, onOpenChange }: ClientInfoDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { addSale } = useSales()

  // Client information state
  const [client, setClient] = useState<Client>({
    nombre: "",
    apellido: "",
    identificacion: "",
    tipoIdentificacion: "national-id",
    direccion: "",
    telefono: "",
    email: "",
  })

  // Product rows state
  const [productRows, setProductRows] = useState<ProductItem[]>([
    { id: 1, productValue: "0", quantity: "1", inventory: "0" },
  ])

  const handleClientChange = (field: keyof Client, value: string) => {
    setClient((prev) => ({ ...prev, [field]: value }))
  }

  const addProductRow = () => {
    const newId = Math.max(...productRows.map((row) => row.id)) + 1
    setProductRows([...productRows, { id: newId, productValue: "0", quantity: "1", inventory: "0" }])
  }

  const removeProductRow = (id: number) => {
    if (productRows.length <= 1) {
      toast({
        title: "No se puede eliminar",
        description: "Debe haber al menos un producto en la venta",
        variant: "destructive",
      })
      return
    }
    setProductRows(productRows.filter((row) => row.id !== id))
  }

  const updateProductRow = (id: number, field: keyof ProductItem, value: string) => {
    setProductRows(productRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const handleCreateSale = () => {
    // Validate client information
    if (!client.nombre || !client.apellido || !client.identificacion) {
      toast({
        title: "Información incompleta",
        description: "Por favor complete la información básica del cliente",
        variant: "destructive",
      })
      return
    }

    // Validate product information
    const invalidProducts = productRows.some(
      (product) => Number.parseFloat(product.productValue) <= 0 || Number.parseInt(product.quantity) <= 0,
    )

    if (invalidProducts) {
      toast({
        title: "Productos inválidos",
        description: "Todos los productos deben tener un valor y cantidad mayor a cero",
        variant: "destructive",
      })
      return
    }

    // Create the sale
    addSale(client, productRows)

    // Close dialog and reset form
    onOpenChange(false)
    setClient({
      nombre: "",
      apellido: "",
      identificacion: "",
      tipoIdentificacion: "national-id",
      direccion: "",
      telefono: "",
      email: "",
    })
    setProductRows([{ id: 1, productValue: "0", quantity: "1", inventory: "0" }])

    toast({
      title: "Venta registrada exitosamente",
      description: "Puede ver y gestionar sus ventas en el módulo de ventas",
    })
  }

  // Calculate total
  const total = productRows.reduce((sum, product) => {
    return sum + (Number.parseFloat(product.productValue) * Number.parseInt(product.quantity) || 0)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Información del cliente</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" value={client.nombre} onChange={(e) => handleClientChange("nombre", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              value={client.apellido}
              onChange={(e) => handleClientChange("apellido", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identificacion">Identificación</Label>
            <Input
              id="identificacion"
              value={client.identificacion}
              onChange={(e) => handleClientChange("identificacion", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo-identificacion">Tipo Identificación</Label>
            <Select
              value={client.tipoIdentificacion}
              onValueChange={(value) => handleClientChange("tipoIdentificacion", value)}
            >
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
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={client.direccion}
              onChange={(e) => handleClientChange("direccion", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={client.telefono}
              onChange={(e) => handleClientChange("telefono", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={client.email}
              onChange={(e) => handleClientChange("email", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Detalles de Venta</h3>

          {productRows.map((row) => (
            <div key={row.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor={`product-value-${row.id}`}>Valor del Producto</Label>
                <Input
                  id={`product-value-${row.id}`}
                  value={row.productValue}
                  onChange={(e) => updateProductRow(row.id, "productValue", e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`quantity-${row.id}`}>Cantidad</Label>
                <Input
                  id={`quantity-${row.id}`}
                  value={row.quantity}
                  onChange={(e) => updateProductRow(row.id, "quantity", e.target.value)}
                  type="number"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`inventory-${row.id}`}>Inventario</Label>
                <div className="flex space-x-2">
                  <Input
                    id={`inventory-${row.id}`}
                    value={row.inventory}
                    onChange={(e) => updateProductRow(row.id, "inventory", e.target.value)}
                    className="flex-1"
                    type="number"
                    min="0"
                  />
                  <Button variant="destructive" size="icon" onClick={() => removeProductRow(row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-between items-center mt-6">
          <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
          <div className="flex space-x-2">
            <Button className="bg-purple-900 hover:bg-purple-800" onClick={addProductRow}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
            <Button className="bg-green-700 hover:bg-green-600" onClick={handleCreateSale}>
              <Save className="h-4 w-4 mr-2" />
              Crear Venta
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

