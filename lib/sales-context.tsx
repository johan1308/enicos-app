"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { formatNumber } from "@/lib/utils"
import { initialSales } from "@/data/SaleInitial"

export interface ProductItem {
  id: number
  productId?: number
  productName?: string
  productSku?: string
  productValue: string
  quantity: string
  inventory: string
}

export interface Client {
  id?: number
  nombre: string
  apellido: string
  identificacion: string
  tipoIdentificacion: string
  direccion: string
  telefono: string
  email: string
}

export interface PaymentMethod {
  type: "efectivo" | "tarjeta" | "transferencia"
  amountUSD: number
  amountBS: number
  reference?: string
  bank?: string
  cardLastDigits?: string
}

export interface ChangeInfo {
  amount: number
  amountBs: number
  method: "efectivo" | "transferencia"
  reference?: string
  bank?: string
}

export interface Sale {
  id: number
  date: string
  clientId: number
  clientName: string
  products: ProductItem[]
  total: number
  totalBs: number
  debt: number
  debtBs: number
  currencyRate: number
  status: "pendiente" | "pagada" | "anulada"
  createdBy: string
  payments: PaymentMethod[]
  change?: ChangeInfo // Información del vuelto
}

interface SalesContextType {
  sales: Sale[]
  currencyRate: number
  setCurrencyRate: (rate: number) => void
  addSale: (client: Client, products: ProductItem[], payments: PaymentMethod[], change?: ChangeInfo) => void
  getSales: () => Sale[]
  updateSaleStatus: (id: number, status: "pendiente" | "pagada" | "anulada") => void
  addPaymentToSale: (saleId: number, payment: PaymentMethod) => void
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [currencyRate, setCurrencyRate] = useState<number>(64.6116) // Tasa de cambio fija
  const { toast } = useToast()

  // Load sales and currency rate from localStorage on initial render
  useEffect(() => {
    const savedSales = localStorage.getItem("enicos_sales")
    if (savedSales) {
      setSales(JSON.parse(savedSales))
    }

    const savedRate = localStorage.getItem("enicos_currency_rate")
    if (savedRate) {
      setCurrencyRate(Number(savedRate))
    }
  }, [])

  // Save sales to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("enicos_sales", JSON.stringify(sales))
  }, [sales])

  // Save currency rate to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("enicos_currency_rate", currencyRate.toString())
  }, [currencyRate])

  const addSale = (client: Client, products: ProductItem[], payments: PaymentMethod[] = [], change?: ChangeInfo) => {
    // Calculate total from products
    const total = products.reduce((sum, product) => {
      return sum + (Number.parseFloat(product.productValue) * Number.parseInt(product.quantity) || 0)
    }, 0)

    const totalBs = total * currencyRate

    // Calculate total paid amount
    const paidAmountUSD = payments.reduce((sum, payment) => sum + payment.amountUSD, 0)
    const paidAmountBS = payments.reduce((sum, payment) => sum + payment.amountBS, 0)

    // Calculate remaining debt
    const debtUSD = total - paidAmountUSD
    const debtBS = totalBs - paidAmountBS

    // Generate a new sale with client ID
    const newSale: Sale = {
      id: Date.now(),
      date: new Date().toISOString(),
      clientId: client.id || Date.now(),
      clientName: `${client.nombre} ${client.apellido}`,
      products,
      total,
      totalBs,
      debt: debtUSD,
      debtBs: debtBS,
      currencyRate,
      status: debtUSD <= 0 ? "pagada" : "pendiente",
      createdBy: "Tom Cook",
      payments,
      change, // Agregar información del vuelto si existe
    }

    setSales((prevSales) => [...prevSales, newSale])

    toast({
      title: "Venta creada",
      description: `Venta por $${formatNumber(total)} / Bs. ${formatNumber(totalBs)} creada exitosamente`,
    })

    return newSale
  }

  const getSales = () => {
    return sales
  }

  const updateSaleStatus = (id: number, status: "pendiente" | "pagada" | "anulada") => {
    setSales((prevSales) => prevSales.map((sale) => (sale.id === id ? { ...sale, status } : sale)))

    toast({
      title: "Estado de venta actualizado",
      description: `La venta ha sido marcada como ${status}`,
    })
  }

  const addPaymentToSale = (saleId: number, payment: PaymentMethod) => {
    setSales((prevSales) =>
      prevSales.map((sale) => {
        if (sale.id === saleId) {
          // Calculate new debt after adding this payment
          const newDebt = sale.debt - payment.amountUSD
          const newDebtBs = sale.debtBs - payment.amountBS

          // Determine if the sale is now fully paid
          const newStatus = newDebt <= 0 ? "pagada" : "pendiente"

          return {
            ...sale,
            payments: [...sale.payments, payment],
            debt: newDebt,
            debtBs: newDebtBs,
            status: newStatus,
          }
        }
        return sale
      }),
    )

    // Store temporary payment for the current sale process
    const tempPaymentKey = `enicos_temp_payments_${saleId}`
    const existingPayments = localStorage.getItem(tempPaymentKey)
    const payments = existingPayments ? [...JSON.parse(existingPayments), payment] : [payment]
    localStorage.setItem(tempPaymentKey, JSON.stringify(payments))

    toast({
      title: "Pago registrado",
      description: `Se ha registrado un pago de $${formatNumber(payment.amountUSD)} / Bs. ${formatNumber(payment.amountBS)}`,
    })
  }

  return (
    <SalesContext.Provider
      value={{
        sales,
        currencyRate,
        setCurrencyRate,
        addSale,
        getSales,
        updateSaleStatus,
        addPaymentToSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  )
}

export function useSales() {
  const context = useContext(SalesContext)
  if (context === undefined) {
    throw new Error("useSales must be used within a SalesProvider")
  }
  return context
}

