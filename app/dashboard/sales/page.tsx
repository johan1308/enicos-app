"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, DollarSign, Users, TrendingUp, CreditCard, Eye, ChartArea } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSales } from "@/lib/sales-context"
import { format } from "date-fns"
import { PaymentMethodDialog } from "@/components/sales/payment-method-dialog"
import { InvoiceDialog } from "@/components/sales/invoice-dialog"
import { formatNumber } from "@/lib/utils"

export default function SalesPage() {
  const { sales, updateSaleStatus } = useSales()
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any>(null)

  // Calculate summary metrics
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const countSales = sales.length
  const totalProducts = sales.reduce((sum, sale) => {
    return sum + sale.products.reduce((pSum, product) => pSum + Number.parseInt(product.quantity), 0)
  }, 0)
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0

  const handleUpdateStatus = (id: number, status: "pendiente" | "pagada" | "anulada") => {
    updateSaleStatus(id, status)
  }

  const handleAddPayment = (saleId: number) => {
    setSelectedSaleId(saleId)
    setIsPaymentDialogOpen(true)
  }

  const handleViewInvoice = (sale: any) => {
    setSelectedSale(sale)
    setIsInvoiceDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ventas</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatNumber(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cantidad ventas</CardTitle>
            <ChartArea className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio de ventas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatNumber(averageSale)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos vendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Ventas recientes</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Total (Bs)</TableHead>
                <TableHead>Deuda</TableHead>
                <TableHead>Deuda (Bs)</TableHead>
                <TableHead>Tasa</TableHead>
                <TableHead>Vuelto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    No hay ventas registradas
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id} className={sale.status === "anulada" ? "opacity-60" : ""}>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell>{format(new Date(sale.date), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>{sale.clientName}</TableCell>
                    <TableCell>${formatNumber(sale.total)}</TableCell>
                    <TableCell>Bs. {formatNumber(sale.totalBs)}</TableCell>
                    <TableCell>${formatNumber(sale.debt)}</TableCell>
                    <TableCell>Bs. {formatNumber(sale.debtBs)}</TableCell>
                    <TableCell>{sale.currencyRate}</TableCell>
                    <TableCell>
                      {sale.change && sale.change.amount > 0 ? (
                        <div className="text-green-500">
                          <div>${formatNumber(sale.change.amount)}</div>
                          <div className="text-xs">
                            {sale.change.method === "efectivo" ? "Efectivo" : "Transferencia"}
                            {sale.change.reference && ` (Ref: ${sale.change.reference})`}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          sale.status === "pendiente"
                            ? "bg-yellow-500"
                            : sale.status === "pagada"
                              ? "bg-green-500"
                              : "bg-red-500"
                        }
                      >
                        {sale.status === "pendiente" ? "Pendiente" : sale.status === "pagada" ? "Pagada" : "Anulada"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(sale)}
                          className="text-purple-500 border-purple-500 hover:bg-purple-500 hover:text-white"
                          title="Ver factura"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {sale.status !== "anulada" && (
                          <>
                            {sale.status === "pendiente" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddPayment(sale.id)}
                                  className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                                >
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Pagar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(sale.id, "anulada")}
                                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  Anular
                                </Button>
                              </>
                            )}
                            {sale.status === "pagada" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(sale.id, "anulada")}
                                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                              >
                                Anular
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {sales.length > 0 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Anterior</span>
            </Button>
            <div className="text-sm">Página 1 de 1</div>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Siguiente</span>
            </Button>
          </div>
        )}
      </div>

      {selectedSaleId && (
        <PaymentMethodDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          saleId={selectedSaleId}
          onPaymentAdded={() => setIsPaymentDialogOpen(false)}
        />
      )}

      <InvoiceDialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen} sale={selectedSale} />

      <footer className="text-center text-xs text-muted-foreground mt-8">
        © 2025 ENICOS UNEXCA, Inc. Todos los derechos reservados.
      </footer>
    </div>
  )
}

