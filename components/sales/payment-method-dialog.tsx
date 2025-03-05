"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSales, type PaymentMethod } from "@/lib/sales-context"
import { CreditCard, DollarSign, BanknoteIcon, ArrowRightLeft } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface PaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  saleId?: number
  onPaymentAdded?: () => void
}

export function PaymentMethodDialog({ open, onOpenChange, saleId, onPaymentAdded }: PaymentMethodDialogProps) {
  const { currencyRate, addPaymentToSale } = useSales()

  const [paymentType, setPaymentType] = useState<"efectivo" | "tarjeta" | "transferencia">("efectivo")
  const [currency, setCurrency] = useState<"usd" | "bs">("usd")
  const [amountUSD, setAmountUSD] = useState<string>("")
  const [amountBS, setAmountBS] = useState<string>("")
  const [reference, setReference] = useState<string>("")
  const [bank, setBank] = useState<string>("")
  const [cardLastDigits, setCardLastDigits] = useState<string>("")

  // Update the other currency amount when one changes
  useEffect(() => {
    if (currency === "usd" && amountUSD) {
      const bsAmount = Number.parseFloat(amountUSD) * currencyRate
      setAmountBS(bsAmount.toFixed(2))
    } else if (currency === "bs" && amountBS) {
      const usdAmount = Number.parseFloat(amountBS) / currencyRate
      setAmountUSD(usdAmount.toFixed(2))
    }
  }, [amountUSD, amountBS, currency, currencyRate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!saleId) return

    const payment: PaymentMethod = {
      type: paymentType,
      amountUSD: Number.parseFloat(amountUSD) || 0,
      amountBS: Number.parseFloat(amountBS) || 0,
      reference: reference || undefined,
      bank: bank || undefined,
      cardLastDigits: cardLastDigits || undefined,
    }

    addPaymentToSale(saleId, payment)
    resetForm()
    onOpenChange(false)

    if (onPaymentAdded) {
      onPaymentAdded()
    }
  }

  const resetForm = () => {
    setPaymentType("efectivo")
    setCurrency("usd")
    setAmountUSD("")
    setAmountBS("")
    setReference("")
    setBank("")
    setCardLastDigits("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Método de Pago</DialogTitle>
          <DialogDescription>Seleccione el método de pago y complete la información requerida.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Tipo de Pago</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={paymentType === "efectivo" ? "default" : "outline"}
                  className={`flex-1 ${paymentType === "efectivo" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  onClick={() => setPaymentType("efectivo")}
                >
                  <BanknoteIcon className="h-4 w-4 mr-2" />
                  Efectivo
                </Button>
                <Button
                  type="button"
                  variant={paymentType === "tarjeta" ? "default" : "outline"}
                  className={`flex-1 ${paymentType === "tarjeta" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => setPaymentType("tarjeta")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Tarjeta
                </Button>
                <Button
                  type="button"
                  variant={paymentType === "transferencia" ? "default" : "outline"}
                  className={`flex-1 ${paymentType === "transferencia" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  onClick={() => setPaymentType("transferencia")}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transferencia
                </Button>
              </div>
            </div>

            <Tabs defaultValue="usd" value={currency} onValueChange={(value) => setCurrency(value as "usd" | "bs")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="usd">
                  <DollarSign className="h-4 w-4 mr-2" />
                  USD
                </TabsTrigger>
                <TabsTrigger value="bs">
                  <span className="mr-2">Bs.</span>
                  Bolívares
                </TabsTrigger>
              </TabsList>
              <TabsContent value="usd" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount-usd">Monto en USD</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount-usd"
                      type="text"
                      inputMode="decimal"
                      value={amountUSD}
                      onChange={(e) => {
                        // Permitir solo números y un punto decimal
                        const value = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".")
                        setAmountUSD(value)
                        setCurrency("usd")
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Equivalente a Bs. {amountBS ? formatNumber(Number.parseFloat(amountBS)) : "0,00"} (Tasa:{" "}
                    {currencyRate})
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="bs" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount-bs">Monto en Bolívares</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      Bs.
                    </span>
                    <Input
                      id="amount-bs"
                      type="text"
                      inputMode="decimal"
                      value={amountBS}
                      onChange={(e) => {
                        // Permitir solo números y un punto decimal
                        const value = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".")
                        setAmountBS(value)
                        setCurrency("bs")
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Equivalente a $ {amountUSD ? formatNumber(Number.parseFloat(amountUSD)) : "0,00"} (Tasa:{" "}
                    {currencyRate})
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {paymentType === "transferencia" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referencia</Label>
                  <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank">Banco</Label>
                  <Select value={bank} onValueChange={setBank} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banesco">Banesco</SelectItem>
                      <SelectItem value="provincial">Provincial</SelectItem>
                      <SelectItem value="mercantil">Mercantil</SelectItem>
                      <SelectItem value="venezuela">Venezuela</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {paymentType === "tarjeta" && (
              <div className="py-2">
                <p className="text-sm text-muted-foreground">Pago con tarjeta de débito</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Registrar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

