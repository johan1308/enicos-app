"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventory, type InventoryHistoryEntry } from "@/lib/inventory-context"
import { useSuppliers } from "@/lib/suppliers-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatNumber } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Printer } from "lucide-react"

interface ViewItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: number
}

export function ViewItemDialog({ open, onOpenChange, itemId }: ViewItemDialogProps) {
  const { getItem, getItemHistory } = useInventory()
  const { suppliers } = useSuppliers()
  const [item, setItem] = useState<any>(null)
  const [history, setHistory] = useState<InventoryHistoryEntry[]>([])
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    if (open && itemId) {
      const inventoryItem = getItem(itemId)
      if (inventoryItem) {
        setItem(inventoryItem)
        setHistory(getItemHistory(itemId))
      }
    }
  }, [open, itemId, getItem, getItemHistory])

  if (!item) return null

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    return supplier ? supplier.name : `Proveedor ${supplierId}`
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Detalles del Producto - ${item.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; }
              h1 { color: #4c1d95; }
              .section { margin-bottom: 20px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              .label { font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f8f9fa; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${item.name}</h1>
              
              <div class="section">
                <h2>Detalles del Producto</h2>
                <div class="grid">
                  <div>
                    <p><span class="label">ID:</span> ${item.id}</p>
                    <p><span class="label">SKU:</span> ${item.sku || "-"}</p>
                    <p><span class="label">Categoría:</span> ${item.category || "-"}</p>
                    <p><span class="label">Valor:</span> $${formatNumber(item.value)}</p>
                    <p><span class="label">Cantidad:</span> ${item.quantity}</p>
                    <p><span class="label">Estado:</span> ${item.status}</p>
                  </div>
                  <div>
                    <p><span class="label">Ubicación:</span> ${item.location || "-"}</p>
                    <p><span class="label">Proveedor:</span> ${getSupplierName(item.supplierId)}</p>
                    <p><span class="label">Tipo de Transacción:</span> ${item.transactionType}</p>
                    <p><span class="label">Creado Por:</span> ${item.createdBy}</p>
                    <p><span class="label">Fecha de Creación:</span> ${format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                    <p><span class="label">Última Actualización:</span> ${item.lastUpdated ? format(new Date(item.lastUpdated), "dd/MM/yyyy HH:mm", { locale: es }) : "-"}</p>
                  </div>
                </div>
                ${item.description ? `<p><span class="label">Descripción:</span> ${item.description}</p>` : ""}
              </div>
              
              <div class="section">
                <h2>Historial de Inventario</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cantidad</th>
                      <th>Anterior</th>
                      <th>Nueva</th>
                      <th>Proveedor</th>
                      <th>Tipo</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${history
                      .map(
                        (entry) => `
                      <tr>
                        <td>${format(new Date(entry.date), "dd/MM/yyyy HH:mm", { locale: es })}</td>
                        <td>${entry.quantity > 0 ? "+" : ""}${entry.quantity}</td>
                        <td>${entry.previousQuantity}</td>
                        <td>${entry.newQuantity}</td>
                        <td>${getSupplierName(entry.supplierId)}</td>
                        <td>${entry.transactionType}</td>
                        <td>${entry.notes || "-"}</td>
                      </tr>
                    `,
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Detalles del Producto: {item.name}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Imprimir
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="history">Historial de Inventario</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">ID</div>
                <div>{item.id}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">SKU</div>
                <div>{item.sku || "-"}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Categoría</div>
                <div>{item.category || "-"}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Valor</div>
                <div>${formatNumber(item.value)}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Cantidad</div>
                <div>{item.quantity}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Estado</div>
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
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Ubicación</div>
                <div>{item.location || "-"}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Proveedor</div>
                <div>{getSupplierName(item.supplierId)}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Tipo de Transacción</div>
                <div>{item.transactionType}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Creado Por</div>
                <div>{item.createdBy}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Fecha de Creación</div>
                <div>{format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">Última Actualización</div>
                <div>
                  {item.lastUpdated ? format(new Date(item.lastUpdated), "dd/MM/yyyy HH:mm", { locale: es }) : "-"}
                </div>
              </div>
            </div>

            {item.description && (
              <div className="space-y-2 mt-4">
                <div className="font-medium text-sm text-muted-foreground">Descripción</div>
                <div className="text-sm">{item.description}</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay registros de historial para este producto
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Anterior</TableHead>
                    <TableHead>Nueva</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                      <TableCell className={entry.quantity > 0 ? "text-green-500" : "text-red-500"}>
                        {entry.quantity > 0 ? "+" : ""}
                        {entry.quantity}
                      </TableCell>
                      <TableCell>{entry.previousQuantity}</TableCell>
                      <TableCell>{entry.newQuantity}</TableCell>
                      <TableCell>{getSupplierName(entry.supplierId)}</TableCell>
                      <TableCell>{entry.transactionType}</TableCell>
                      <TableCell>{entry.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

