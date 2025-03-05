"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

export interface InventoryHistoryEntry {
  id: number
  itemId: number
  date: string
  quantity: number
  previousQuantity: number
  newQuantity: number
  supplierId: number
  transactionType: "Compra" | "Venta" | "Devolución" | "Ajuste"
  notes?: string
  createdBy: string
}

export interface InventoryItem {
  id: number
  name: string
  value: number
  quantity: number
  status: string
  transactionType: string
  supplierId: number
  createdBy: string
  createdAt: string
  lastUpdated: string | null
  location?: string
  description?: string
  category?: string
  sku?: string
}

interface InventoryContextType {
  inventory: InventoryItem[]
  inventoryHistory: InventoryHistoryEntry[]
  addItem: (item: Omit<InventoryItem, "id" | "createdAt" | "lastUpdated">) => void
  updateItem: (id: number, item: Partial<InventoryItem>) => void
  deleteItem: (id: number) => void
  getItem: (id: number) => InventoryItem | undefined
  addStock: (itemId: number, quantity: number, supplierId: number, notes?: string) => void
  getItemHistory: (itemId: number) => InventoryHistoryEntry[]
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

// Sample initial inventory data
const initialInventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "Producto de ejemplo",
    value: 100.0,
    quantity: 50,
    status: "Activo",
    transactionType: "Compra",
    supplierId: 1,
    createdBy: "Juan Pérez",
    createdAt: new Date().toISOString(),
    lastUpdated: null,
    location: "Almacén principal",
    description: "Un producto de ejemplo para mostrar en el inventario",
    category: "General",
    sku: "SKU-001",
  },
]

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistoryEntry[]>([])
  const { toast } = useToast()

  // Load inventory from localStorage on initial render
  useEffect(() => {
    const savedInventory = localStorage.getItem("enicos_inventory")
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory))
    } else {
      // Use initial data if no saved data exists
      setInventory(initialInventoryData)
      localStorage.setItem("enicos_inventory", JSON.stringify(initialInventoryData))
    }

    const savedHistory = localStorage.getItem("enicos_inventory_history")
    if (savedHistory) {
      setInventoryHistory(JSON.parse(savedHistory))
    } else {
      // Inicializar con un historial vacío
      localStorage.setItem("enicos_inventory_history", JSON.stringify([]))
    }
  }, [])

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("enicos_inventory", JSON.stringify(inventory))
  }, [inventory])

  // Save inventory history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("enicos_inventory_history", JSON.stringify(inventoryHistory))
  }, [inventoryHistory])

  const addItem = (item: Omit<InventoryItem, "id" | "createdAt" | "lastUpdated">) => {
    // Calcular el siguiente ID basado en el ID más alto existente
    const nextId = inventory.length > 0 ? Math.max(...inventory.map((item) => item.id)) + 1 : 1

    const newItem: InventoryItem = {
      ...item,
      id: nextId,
      createdAt: new Date().toISOString(),
      lastUpdated: null,
    }

    setInventory((prevInventory) => [...prevInventory, newItem])

    // Registrar en el historial
    const historyEntry: InventoryHistoryEntry = {
      id: Date.now(),
      itemId: nextId,
      date: new Date().toISOString(),
      quantity: item.quantity,
      previousQuantity: 0,
      newQuantity: item.quantity,
      supplierId: item.supplierId,
      transactionType: "Compra",
      notes: "Creación inicial del producto",
      createdBy: item.createdBy,
    }

    setInventoryHistory((prevHistory) => [...prevHistory, historyEntry])

    toast({
      title: "Producto agregado",
      description: `${item.name} ha sido agregado al inventario`,
    })

    return newItem
  }

  const updateItem = (id: number, updatedFields: Partial<InventoryItem>) => {
    const item = inventory.find((item) => item.id === id)
    if (!item) return

    // Si se está actualizando la cantidad, registrar en el historial
    // SOLO si no viene de una operación de addStock (no tiene supplierId)
    if (updatedFields.quantity !== undefined && updatedFields.quantity !== item.quantity && !updatedFields.supplierId) {
      const historyEntry: InventoryHistoryEntry = {
        id: Date.now(),
        itemId: id,
        date: new Date().toISOString(),
        quantity: updatedFields.quantity - item.quantity,
        previousQuantity: item.quantity,
        newQuantity: updatedFields.quantity,
        supplierId: updatedFields.supplierId || item.supplierId,
        transactionType: "Ajuste",
        notes: "Actualización manual del producto",
        createdBy: "Usuario del sistema",
      }

      setInventoryHistory((prevHistory) => [...prevHistory, historyEntry])
    }

    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedFields,
              lastUpdated: new Date().toISOString(),
            }
          : item,
      ),
    )

    toast({
      title: "Producto actualizado",
      description: "El producto ha sido actualizado exitosamente",
    })
  }

  const deleteItem = (id: number) => {
    setInventory((prevInventory) => prevInventory.filter((item) => item.id !== id))

    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del inventario",
    })
  }

  const getItem = (id: number) => {
    return inventory.find((item) => item.id === id)
  }

  const addStock = (itemId: number, quantity: number, supplierId: number, notes?: string) => {
    const item = inventory.find((item) => item.id === itemId)
    if (!item) return

    const previousQuantity = item.quantity
    const newQuantity = previousQuantity + quantity

    // Actualizar el inventario
    updateItem(itemId, {
      quantity: newQuantity,
      supplierId,
      status: newQuantity > 0 ? (item.status === "Agotado" ? "Activo" : item.status) : "Agotado",
    })

    // Registrar en el historial
    const historyEntry: InventoryHistoryEntry = {
      id: Date.now(),
      itemId,
      date: new Date().toISOString(),
      quantity,
      previousQuantity,
      newQuantity,
      supplierId,
      transactionType: "Compra",
      notes: notes || "Adición de stock",
      createdBy: "Usuario del sistema",
    }

    setInventoryHistory((prevHistory) => [...prevHistory, historyEntry])

    toast({
      title: "Stock actualizado",
      description: `Se han añadido ${quantity} unidades al producto ${item.name}`,
    })
  }

  const getItemHistory = (itemId: number) => {
    return inventoryHistory
      .filter((entry) => entry.itemId === itemId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        inventoryHistory,
        addItem,
        updateItem,
        deleteItem,
        getItem,
        addStock,
        getItemHistory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}

