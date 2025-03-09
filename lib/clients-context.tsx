"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { clientInitial } from "@/data/ClientInitial"

export interface Client {
  id: number
  nombre: string
  apellido: string
  identificacion: string
  tipoIdentificacion: string
  direccion: string
  telefono: string
  email: string
  createdAt: string
  lastUpdated: string | null
}

interface ClientsContextType {
  clients: Client[]
  addClient: (client: Omit<Client, "id" | "createdAt" | "lastUpdated">) => Client
  updateClient: (id: number, client: Partial<Client>) => void
  deleteClient: (id: number) => void
  getClient: (id: number) => Client | undefined
  getClientByIdentificacion: (identificacion: string) => Client | undefined
  searchClients: (term: string) => Client[]
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined)

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(clientInitial)
  const { toast } = useToast()

  // Load clients from localStorage on initial render
  useEffect(() => {
    const savedClients = localStorage.getItem("enicos_clients")
    if (savedClients) {
      setClients(JSON.parse(savedClients))
    }
  }, [])

  // Save clients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("enicos_clients", JSON.stringify(clients))
  }, [clients])

  const addClient = (client: Omit<Client, "id" | "createdAt" | "lastUpdated">) => {
    // Check if client with same identification already exists
    const existingClient = clients.find(
      (c) => c.identificacion === client.identificacion && c.tipoIdentificacion === client.tipoIdentificacion,
    )

    if (existingClient) {
      // Update existing client with new information
      const updatedClient = {
        ...existingClient,
        ...client,
        lastUpdated: new Date().toISOString(),
      }

      setClients((prevClients) => prevClients.map((c) => (c.id === existingClient.id ? updatedClient : c)))

      toast({
        title: "Cliente actualizado",
        description: `La información de ${client.nombre} ${client.apellido} ha sido actualizada`,
      })

      return updatedClient
    }

    // Create new client with a unique ID
    const newClient: Client = {
      ...client,
      id: Date.now() + Math.floor(Math.random() * 1000), // Asegurar ID único
      createdAt: new Date().toISOString(),
      lastUpdated: null,
    }

    // Agregar el nuevo cliente al array existente
    setClients((prevClients) => [...prevClients, newClient])

    toast({
      title: "Cliente registrado",
      description: `${client.nombre} ${client.apellido} ha sido registrado correctamente`,
    })

    return newClient
  }

  const updateClient = (id: number, updatedFields: Partial<Client>) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === id
          ? {
              ...client,
              ...updatedFields,
              lastUpdated: new Date().toISOString(),
            }
          : client,
      ),
    )

    toast({
      title: "Cliente actualizado",
      description: "La información del cliente ha sido actualizada exitosamente",
    })
  }

  const deleteClient = (id: number) => {
    setClients((prevClients) => prevClients.filter((client) => client.id !== id))

    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado correctamente",
    })
  }

  const getClient = (id: number) => {
    return clients.find((client) => client.id === id)
  }

  const getClientByIdentificacion = (identificacion: string) => {
    return clients.find((client) => client.identificacion === identificacion)
  }

  const searchClients = (term: string) => {
    if (!term) {
      // Si no hay término de búsqueda, devolver todos los clientes ordenados por fecha
      return [...clients].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    const searchTerm = term.toLowerCase()
    return clients.filter(
      (client) =>
        client.nombre.toLowerCase().includes(searchTerm) ||
        client.apellido.toLowerCase().includes(searchTerm) ||
        client.identificacion.toLowerCase().includes(searchTerm) ||
        `${client.nombre} ${client.apellido}`.toLowerCase().includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm)) ||
        (client.telefono && client.telefono.toLowerCase().includes(searchTerm)),
    )
  }

  return (
    <ClientsContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        getClientByIdentificacion,
        searchClients,
      }}
    >
      {children}
    </ClientsContext.Provider>
  )
}

export function useClients() {
  const context = useContext(ClientsContext)
  if (context === undefined) {
    throw new Error("useClients must be used within a ClientsProvider")
  }
  return context
}

