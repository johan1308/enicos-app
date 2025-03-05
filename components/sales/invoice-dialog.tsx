"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Printer, Download } from "lucide-react"
import type { Sale } from "@/lib/sales-context"
import { useRef } from "react"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: Sale | null
}

export function InvoiceDialog({ open, onOpenChange, sale }: InvoiceDialogProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  if (!sale) return null

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML || ""
    const printWindow = window.open("", "_blank")

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Factura ENICOS - ${sale.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f8f9fa; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; }
              .total-row { font-weight: bold; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${printContent}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleDownload = () => {
    const printContent = invoiceRef.current?.innerHTML || ""
    const blob = new Blob(
      [
        `
      <html>
        <head>
          <title>Factura ENICOS - ${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
            .total-row { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${printContent}
          </div>
        </body>
      </html>
    `,
      ],
      { type: "text/html" },
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `factura-enicos-${sale.id}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Factura de Venta #{sale.id}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={invoiceRef} className="space-y-6 py-4">
          {/* Encabezado de la factura */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h2 className="text-xl font-bold">ENICOS</h2>
              <p className="text-sm text-muted-foreground">Sistema de Gestión de Inventario</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Factura #{sale.id}</p>
              <p className="text-sm text-muted-foreground">
                Fecha: {format(new Date(sale.date), "dd/MM/yyyy HH:mm", { locale: es })}
              </p>
              <p className="text-sm text-muted-foreground">
                Estado:{" "}
                <span
                  className={
                    sale.status === "pagada"
                      ? "text-green-500"
                      : sale.status === "pendiente"
                        ? "text-yellow-500"
                        : "text-red-500"
                  }
                >
                  {sale.status === "pagada" ? "PAGADA" : sale.status === "pendiente" ? "PENDIENTE" : "ANULADA"}
                </span>
              </p>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">Nombre:</span> {sale.clientName}
                </p>
                <p>
                  <span className="font-medium">ID Cliente:</span> {sale.clientId}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">Tasa de cambio:</span> {sale.currencyRate} Bs/$
                </p>
                <p>
                  <span className="font-medium">Vendedor:</span> {sale.createdBy}
                </p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Productos</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-left py-2">SKU</th>
                  <th className="text-right py-2">Precio</th>
                  <th className="text-right py-2">Cantidad</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.products.map((product, index) => {
                  const subtotal = Number(product.productValue) * Number(product.quantity)
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2">{product.productName || `Producto ${index + 1}`}</td>
                      <td className="py-2">{product.productSku || "-"}</td>
                      <td className="py-2 text-right">${formatNumber(Number(product.productValue))}</td>
                      <td className="py-2 text-right">{product.quantity}</td>
                      <td className="py-2 text-right">${formatNumber(subtotal)}</td>
                    </tr>
                  )
                })}
                <tr className="font-medium">
                  <td colSpan={4} className="py-2 text-right">
                    Total:
                  </td>
                  <td className="py-2 text-right">${formatNumber(sale.total)}</td>
                </tr>
                <tr className="text-muted-foreground">
                  <td colSpan={4} className="py-2 text-right">
                    Total (Bs):
                  </td>
                  <td className="py-2 text-right">Bs. {formatNumber(sale.totalBs)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagos */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Métodos de Pago</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Detalles</th>
                  <th className="text-right py-2">Monto USD</th>
                  <th className="text-right py-2">Monto Bs</th>
                </tr>
              </thead>
              <tbody>
                {sale.payments.map((payment, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      {payment.type === "efectivo"
                        ? "Efectivo"
                        : payment.type === "tarjeta"
                          ? "Tarjeta"
                          : "Transferencia"}
                    </td>
                    <td className="py-2">
                      {payment.type === "tarjeta" && payment.cardLastDigits
                        ? `**** ${payment.cardLastDigits}`
                        : payment.type === "transferencia" && payment.reference
                          ? `Ref: ${payment.reference} (${payment.bank || "N/A"})`
                          : "-"}
                    </td>
                    <td className="py-2 text-right">${formatNumber(payment.amountUSD)}</td>
                    <td className="py-2 text-right">Bs. {formatNumber(payment.amountBS)}</td>
                  </tr>
                ))}
                <tr className="font-medium">
                  <td colSpan={2} className="py-2 text-right">
                    Total Pagado:
                  </td>
                  <td className="py-2 text-right">
                    ${formatNumber(sale.payments.reduce((sum, p) => sum + p.amountUSD, 0))}
                  </td>
                  <td className="py-2 text-right">
                    Bs. {formatNumber(sale.payments.reduce((sum, p) => sum + p.amountBS, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vuelto */}
          {sale.change && sale.change.amount > 0 && (
            <div className="border rounded-md p-4 bg-green-50 dark:bg-green-900/20">
              <h3 className="font-medium mb-2">Vuelto al Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <span className="font-medium">Monto:</span> ${formatNumber(sale.change.amount)}
                  </p>
                  <p>
                    <span className="font-medium">Monto (Bs):</span> Bs. {formatNumber(sale.change.amountBs)}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Método:</span>
                    {sale.change.method === "efectivo" ? "Efectivo" : "Transferencia"}
                  </p>
                  {sale.change.method === "transferencia" && (
                    <>
                      <p>
                        <span className="font-medium">Referencia:</span> {sale.change.reference}
                      </p>
                      <p>
                        <span className="font-medium">Banco:</span> {sale.change.bank}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900/20">
            <h3 className="font-medium mb-2">Resumen</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">Total de la venta:</span> ${formatNumber(sale.total)}
                </p>
                <p>
                  <span className="font-medium">Total pagado:</span> $
                  {formatNumber(sale.payments.reduce((sum, p) => sum + p.amountUSD, 0))}
                </p>
                {sale.change && sale.change.amount > 0 && (
                  <p>
                    <span className="font-medium">Vuelto entregado:</span> ${formatNumber(sale.change.amount)}
                  </p>
                )}
              </div>
              <div>
                <p>
                  <span className="font-medium">Total (Bs):</span> Bs. {formatNumber(sale.totalBs)}
                </p>
                <p>
                  <span className="font-medium">Total pagado (Bs):</span> Bs.{" "}
                  {formatNumber(sale.payments.reduce((sum, p) => sum + p.amountBS, 0))}
                </p>
                {sale.change && sale.change.amount > 0 && (
                  <p>
                    <span className="font-medium">Vuelto entregado (Bs):</span> Bs. {formatNumber(sale.change.amountBs)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 pt-2 border-t">
              <p>
                <span className="font-medium">Deuda pendiente:</span>
                <span className={sale.debt <= 0 ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
                  ${formatNumber(sale.debt)} / Bs. {formatNumber(sale.debtBs)}
                </span>
              </p>
            </div>
          </div>

          {/* Pie de página */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>ENICOS UNEXCA, Inc. - Sistema de Gestión de Inventario</p>
            <p>Factura generada el {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

