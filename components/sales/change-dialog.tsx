"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BanknoteIcon, ArrowRightLeft } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface ChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  changeAmount: number
  changeAmountBs: number
  onConfirm: (method: "efectivo" | "transferencia", reference?: string, bank?: string) => void
}

export function ChangeDialog({ open, onOpenChange, changeAmount, changeAmountBs, onConfirm }: ChangeDialogProps) {
  const [changeMethod, setChangeMethod] = useState<"efectivo" | "transferencia">("efectivo")
  const [reference, setReference] = useState("")
  const [bank, setBank] = useState("")

  const handleConfirm = () => {
    if (changeMethod === "transferencia" && (!reference || !bank)) {
      return // No permitir confirmar si falta información de transferencia
    }

    onConfirm(
      changeMethod,
      changeMethod === "transferencia" ? reference : undefined,
      changeMethod === "transferencia" ? bank : undefined,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gestionar Vuelto al Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md">
            <p className="font-medium text-center">El cliente tiene un vuelto de:</p>
            <p className="text-xl font-bold text-center text-green-600 dark:text-green-400">
              ${formatNumber(changeAmount)}
            </p>
            <p className="text-sm text-center text-green-600 dark:text-green-400">Bs. {formatNumber(changeAmountBs)}</p>
          </div>

          <div className="space-y-2">
            <Label>Método de devolución</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={changeMethod === "efectivo" ? "default" : "outline"}
                className={`flex-1 ${changeMethod === "efectivo" ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={() => setChangeMethod("efectivo")}
              >
                <BanknoteIcon className="h-4 w-4 mr-2" />
                Efectivo
              </Button>
              <Button
                type="button"
                variant={changeMethod === "transferencia" ? "default" : "outline"}
                className={`flex-1 ${changeMethod === "transferencia" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                onClick={() => setChangeMethod("transferencia")}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transferencia
              </Button>
            </div>
          </div>

          {changeMethod === "transferencia" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia de transferencia</Label>
                <input
                  id="reference"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank">Banco</Label>
                <select
                  id="bank"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  required
                >
                  <option value="">Seleccionar banco</option>
                  <option value="banesco">Banesco</option>
                  <option value="provincial">Provincial</option>
                  <option value="mercantil">Mercantil</option>
                  <option value="venezuela">Venezuela</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleConfirm}
            disabled={changeMethod === "transferencia" && (!reference || !bank)}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

