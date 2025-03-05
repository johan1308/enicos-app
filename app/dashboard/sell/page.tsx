"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save, CreditCard, Search, UserSearch } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  useSales,
  type ProductItem,
  type Client as SalesClient,
  type PaymentMethod,
  type ChangeInfo,
} from "@/lib/sales-context"
import { useInventory } from "@/lib/inventory-context"
import { useClients } from "@/lib/clients-context"
import { PaymentMethodDialog } from "@/components/sales/payment-method-dialog"
import { ChangeDialog } from "@/components/sales/change-dialog"
import { formatNumber } from "@/lib/utils"

export default function SellPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addSale, currencyRate } = useSales()
  const { inventory, updateItem } = useInventory()
  const { addClient, searchClients } = useClients()

  // Client information state
  const [client, setClient] = useState<SalesClient>({
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

  // Payment methods state
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [tempSaleId, setTempSaleId] = useState<number | undefined>(undefined)

  // Change dialog state
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false)
  const [changeInfo, setChangeInfo] = useState<ChangeInfo | null>(null)

  // Client search state
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [clientSearchResults, setClientSearchResults] = useState<any[]>([])
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false)

  // Filter for products
  const [searchTerm, setSearchTerm] = useState("")
  const filteredProducts = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Update client search results when search term changes
  useEffect(() => {
    if (clientSearchTerm.length > 1) {
      const results = searchClients(clientSearchTerm)
      setClientSearchResults(results)
    } else {
      // Si el término de búsqueda está vacío, mostrar algunos clientes recientes
      const allClients = searchClients("")
      setClientSearchResults(allClients.slice(0, 5)) // Mostrar hasta 5 clientes recientes
    }
  }, [clientSearchTerm, searchClients])

  const handleClientChange = (field: keyof SalesClient, value: string) => {
    setClient((prev) => ({ ...prev, [field]: value }))
  }

  const handleClientSelect = (selectedClient: any) => {
    setClient({
      nombre: selectedClient.nombre,
      apellido: selectedClient.apellido,
      identificacion: selectedClient.identificacion,
      tipoIdentificacion: selectedClient.tipoIdentificacion,
      direccion: selectedClient.direccion || "",
      telefono: selectedClient.telefono || "",
      email: selectedClient.email || "",
    })
    setClientSearchTerm(`${selectedClient.nombre} ${selectedClient.apellido}`)

    // Mostrar confirmación de selección
    toast({
      title: "Cliente seleccionado",
      description: `Se ha seleccionado a ${selectedClient.nombre} ${selectedClient.apellido}`,
    })
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

  const handleProductSelection = (id: number, productId: number) => {
    const selectedProduct = inventory.find((item) => item.id === productId)

    if (selectedProduct) {
      setProductRows(
        productRows.map((row) => {
          if (row.id === id) {
            return {
              ...row,
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              productSku: selectedProduct.sku || "",
              productValue: selectedProduct.value.toString(),
              inventory: selectedProduct.quantity.toString(),
            }
          }
          return row
        }),
      )
    }
  }

  const handleAddPayment = () => {
    // Generate a temporary sale ID for the payment dialog
    setTempSaleId(Date.now())
    setIsPaymentDialogOpen(true)
  }

  const removePayment = (index: number) => {
    setPayments((prevPayments) => prevPayments.filter((_, i) => i !== index))
    toast({
      title: "Pago eliminado",
      description: "El método de pago ha sido eliminado correctamente",
    })
  }

  const updateInventoryQuantities = (products: ProductItem[]) => {
    products.forEach((product) => {
      if (product.productId) {
        const inventoryItem = inventory.find((item) => item.id === product.productId)
        if (inventoryItem) {
          const newQuantity = inventoryItem.quantity - Number.parseInt(product.quantity)
          updateItem(product.productId, {
            quantity: newQuantity >= 0 ? newQuantity : 0,
            status: newQuantity <= 0 ? "Agotado" : inventoryItem.status,
          })
        }
      }
    })
  }

  const handleChangeConfirm = (method: "efectivo" | "transferencia", reference?: string, bank?: string) => {
    if (changeInfo) {
      setChangeInfo({
        ...changeInfo,
        method,
        reference,
        bank,
      })

      // Continuar con la creación de la venta después de confirmar el vuelto
      completeCreateSale(changeInfo.amount, changeInfo.amountBs, method, reference, bank)
    }
  }

  const completeCreateSale = (
    changeAmount: number,
    changeAmountBs: number,
    changeMethod: "efectivo" | "transferencia",
    reference?: string,
    bank?: string,
  ) => {
    // Add or update client in the clients database
    const clientData = {
      nombre: client.nombre,
      apellido: client.apellido,
      identificacion: client.identificacion,
      tipoIdentificacion: client.tipoIdentificacion,
      direccion: client.direccion,
      telefono: client.telefono,
      email: client.email,
    }

    // Guardar el cliente y obtener la referencia actualizada
    const savedClient = addClient(clientData)

    // Update inventory quantities
    updateInventoryQuantities(productRows)

    // Crear objeto de información de vuelto
    const change: ChangeInfo = {
      amount: changeAmount,
      amountBs: changeAmountBs,
      method: changeMethod,
      reference,
      bank,
    }

    // Create the sale with the saved client and change info
    addSale(savedClient, productRows, payments, change)

    // Reset form
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
    setPayments([])
    setClientSearchTerm("")
    setChangeInfo(null)

    // Show message that redirects the user to check the sales
    toast({
      title: "Venta registrada exitosamente",
      description: "Puede ver y gestionar sus ventas en el módulo de ventas",
    })

    // Navigate to sales page
    router.push("/dashboard/sales")
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
      (product) =>
        !product.productId || Number.parseFloat(product.productValue) <= 0 || Number.parseInt(product.quantity) <= 0,
    )

    if (invalidProducts) {
      toast({
        title: "Productos inválidos",
        description: "Todos los productos deben ser seleccionados y tener una cantidad mayor a cero",
        variant: "destructive",
      })
      return
    }

    // Validate inventory quantities
    const insufficientInventory = productRows.some((product) => {
      if (!product.productId) return false
      const inventoryQuantity = Number.parseInt(product.inventory)
      const requestedQuantity = Number.parseInt(product.quantity)
      return requestedQuantity > inventoryQuantity
    })

    if (insufficientInventory) {
      toast({
        title: "Inventario insuficiente",
        description: "Uno o más productos no tienen suficiente inventario disponible",
        variant: "destructive",
      })
      return
    }

    // Calculate total and total paid
    const total = productRows.reduce((sum, product) => {
      return sum + (Number.parseFloat(product.productValue) * Number.parseInt(product.quantity) || 0)
    }, 0)

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amountUSD, 0)

    // Validate payment is complete
    if (totalPaid < total) {
      toast({
        title: "Pago incompleto",
        description: "El monto total pagado debe cubrir el valor total de la venta",
        variant: "destructive",
      })
      return
    }

    // Verificar si hay vuelto (pago mayor que el total)
    if (totalPaid > total) {
      const changeAmount = totalPaid - total
      const changeAmountBs = changeAmount * currencyRate

      // Guardar información del vuelto y mostrar el diálogo
      setChangeInfo({
        amount: changeAmount,
        amountBs: changeAmountBs,
        method: "efectivo", // Valor predeterminado
      })

      setIsChangeDialogOpen(true)
      return
    }

    // Si no hay vuelto, continuar con la creación de la venta normalmente
    completeCreateSale(0, 0, "efectivo")
  }

  // Calculate total
  const total = productRows.reduce((sum, product) => {
    return sum + (Number.parseFloat(product.productValue) * Number.parseInt(product.quantity) || 0)
  }, 0)

  // Calculate total in Bs
  const totalBs = total * currencyRate

  // Calculate total paid
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amountUSD, 0)
  const totalPaidBs = payments.reduce((sum, payment) => sum + payment.amountBS, 0)

  // Calculate remaining
  const remaining = total - totalPaid
  const remainingBs = totalBs - totalPaidBs

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Información del cliente</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <Label htmlFor="client-search" className="mb-2 block">
              Buscar cliente existente
            </Label>
            <div className="relative">
              <Select
                onValueChange={(value) => {
                  const selectedClient = clientSearchResults.find((client) => client.id.toString() === value)
                  if (selectedClient) {
                    handleClientSelect(selectedClient)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <UserSearch className="h-4 w-4" />
                    <span>{clientSearchTerm || "Buscar cliente..."}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center border-b px-3 pb-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Buscar cliente..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                    />
                  </div>
                  {clientSearchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm">No se encontraron clientes</div>
                  ) : (
                    clientSearchResults.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {client.nombre} {client.apellido}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {client.identificacion} | {client.email || "Sin email"}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de Venta</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <Label htmlFor="product-search">Buscar Productos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="product-search"
                placeholder="Buscar por nombre, SKU o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {productRows.map((row) => (
            <div key={row.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor={`product-sku-${row.id}`}>Producto (SKU)</Label>
                <Select
                  value={row.productId?.toString() || ""}
                  onValueChange={(value) => handleProductSelection(row.id, Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto por SKU" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.sku || "Sin SKU"} - {product.name} (${formatNumber(product.value)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {row.productId && (
                  <p className="text-xs text-muted-foreground">
                    Valor: ${formatNumber(Number(row.productValue))} | Bs.{" "}
                    {formatNumber(Number(row.productValue) * currencyRate)}
                  </p>
                )}
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
                <Label htmlFor={`inventory-${row.id}`}>Inventario Disponible</Label>
                <div className="flex space-x-2">
                  <Input id={`inventory-${row.id}`} value={row.inventory} readOnly className="flex-1 bg-muted" />
                  <Button variant="destructive" size="icon" onClick={() => removeProductRow(row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button className="bg-purple-900 hover:bg-purple-800" onClick={addProductRow}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col px-6 py-4 border-t space-y-4">
          <div className="w-full flex justify-between items-center">
            <div>
              <div className="text-xl font-bold">Total: ${formatNumber(total)}</div>
              <div className="text-sm text-muted-foreground">Bs. {formatNumber(totalBs)}</div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddPayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              Agregar Método de Pago
            </Button>
          </div>

          {payments.length > 0 && (
            <div className="w-full border rounded-md p-4">
              <h3 className="font-medium mb-2">Pagos Registrados</h3>
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {payment.type === "efectivo"
                          ? "Efectivo"
                          : payment.type === "tarjeta"
                            ? "Tarjeta"
                            : "Transferencia"}
                      </span>
                      {payment.type === "tarjeta" && payment.cardLastDigits && (
                        <span className="text-sm ml-2">**** {payment.cardLastDigits}</span>
                      )}
                      {payment.type === "transferencia" && payment.reference && (
                        <span className="text-sm ml-2">Ref: {payment.reference}</span>
                      )}
                      {payment.type === "transferencia" && payment.bank && (
                        <span className="text-xs ml-2 text-muted-foreground">({payment.bank})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div>${formatNumber(payment.amountUSD)}</div>
                        <div className="text-sm text-muted-foreground">Bs. {formatNumber(payment.amountBS)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => removePayment(index)}
                        title="Eliminar pago"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 font-medium">
                  <div>Total Pagado:</div>
                  <div className="text-right">
                    <div>${formatNumber(totalPaid)}</div>
                    <div className="text-sm text-muted-foreground">Bs. {formatNumber(totalPaidBs)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 font-medium">
                  <div>Restante:</div>
                  <div className={`text-right ${remaining > 0 ? "text-red-500" : "text-green-500"}`}>
                    <div>${formatNumber(remaining)}</div>
                    <div className="text-sm text-muted-foreground">Bs. {formatNumber(remainingBs)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full flex justify-end">
            <Button
              className="bg-green-700 hover:bg-green-600"
              onClick={handleCreateSale}
              disabled={remaining > 0}
              title={remaining > 0 ? "El pago debe cubrir el monto total de la venta" : ""}
            >
              <Save className="h-4 w-4 mr-2" />
              Crear Venta
            </Button>
          </div>
        </CardFooter>
      </Card>

      {tempSaleId && (
        <PaymentMethodDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          saleId={tempSaleId}
          onPaymentAdded={() => {
            // When a payment is added through the dialog, add it to our local state
            const savedPayments = localStorage.getItem(`enicos_temp_payments_${tempSaleId}`)
            if (savedPayments) {
              const parsedPayments = JSON.parse(savedPayments)
              setPayments((prev) => [...prev, ...parsedPayments])
              // Clear the temporary storage
              localStorage.removeItem(`enicos_temp_payments_${tempSaleId}`)
            }
          }}
        />
      )}

      {/* Diálogo para gestionar el vuelto */}
      {changeInfo && (
        <ChangeDialog
          open={isChangeDialogOpen}
          onOpenChange={setIsChangeDialogOpen}
          changeAmount={changeInfo.amount}
          changeAmountBs={changeInfo.amountBs}
          onConfirm={handleChangeConfirm}
        />
      )}

      <footer className="text-center text-xs text-muted-foreground mt-8">
        © 2025 ENICOS UNEXCA, Inc. Todos los derechos reservados.
      </footer>
    </div>
  )
}

