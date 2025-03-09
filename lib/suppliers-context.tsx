"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "@/components/ui/use-toast";

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: string;
  lastUpdated: string | null;
  address?: string;
  contactPerson?: string;
  notes?: string;
}

interface SuppliersContextType {
  suppliers: Supplier[];
  addSupplier: (
    supplier: Omit<Supplier, "id" | "createdAt" | "lastUpdated">
  ) => Supplier;
  updateSupplier: (id: number, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: number) => void;
  getSupplier: (id: number) => Supplier | undefined;
  searchSuppliers: (term: string) => Supplier[];
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(
  undefined
);

// Sample initial suppliers data
const initialSuppliersData: Supplier[] = [
  {
    id: 1,
    name: "Empresas Polar",
    email: "contacto@empresaspolar.com",
    phone: "0212-555-1234",
    active: true,
    createdAt: "2025-03-09T16:45:32Z",
    lastUpdated: null,
    address: "Avenida Vollmer, Caracas",
    contactPerson: "Carlos Pérez",
  },
  {
    id: 2,
    name: "Cavidea",
    email: "info@cavidea.org",
    phone: "0212-555-5678",
    active: true,
    createdAt: "2025-03-09T16:45:32Z",
    lastUpdated: null,
    address: "Avenida Libertador, Caracas",
    contactPerson: "María Gómez",
  },
  {
    id: 3,
    name: "Fertinitro",
    email: "ventas@fertinitro.com",
    phone: "0281-555-9012",
    active: true,
    createdAt: "2025-03-09T16:45:32Z",
    lastUpdated: null,
    address: "Carretera Nacional, Morón",
    contactPerson: "José Rodríguez",
  },
  {
    id: 4,
    name: "Metanol de Oriente (Metor)",
    email: "soporte@metor.com",
    phone: "0281-555-3456",
    active: true,
    createdAt: "2025-03-09T16:45:32Z",
    lastUpdated: null,
    address: "Zona Industrial, Barcelona",
    contactPerson: "Ana Martínez",
  },
  {
    id: 5,
    name: "Profalca",
    email: "contacto@profalca.com",
    phone: "0269-555-7890",
    active: true,
    createdAt: "2025-03-09T16:45:32Z",
    lastUpdated: null,
    address: "Parque Industrial, Punto Fijo",
    contactPerson: "Luis Fernández",
  },
];

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliersData);
  const { toast } = useToast();

  // Load suppliers from localStorage on initial render
  useEffect(() => {
    const savedSuppliers = localStorage.getItem("enicos_suppliers");

    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    } else {
      // Use initial data if no saved data exists
      setSuppliers(initialSuppliersData);
      localStorage.setItem(
        "enicos_suppliers",
        JSON.stringify(initialSuppliersData)
      );
    }
  }, []);

  // Save suppliers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("enicos_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  const addSupplier = (
    supplier: Omit<Supplier, "id" | "createdAt" | "lastUpdated">
  ) => {
    // Create new supplier with a unique ID
    const newSupplier: Supplier = {
      ...supplier,
      id:
        suppliers.length > 0
          ? Math.max(...suppliers.map((supplier) => supplier.id)) + 1
          : 1,
      createdAt: new Date().toISOString(),
      lastUpdated: null,
    };

    // Add the new supplier to the array
    setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);

    toast({
      title: "Proveedor agregado",
      description: `${supplier.name} ha sido agregado correctamente`,
    });

    return newSupplier;
  };

  const updateSupplier = (id: number, updatedFields: Partial<Supplier>) => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.map((supplier) =>
        supplier.id === id
          ? {
              ...supplier,
              ...updatedFields,
              lastUpdated: new Date().toISOString(),
            }
          : supplier
      )
    );

    toast({
      title: "Proveedor actualizado",
      description:
        "La información del proveedor ha sido actualizada exitosamente",
    });
  };

  const deleteSupplier = (id: number) => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.filter((supplier) => supplier.id !== id)
    );

    toast({
      title: "Proveedor eliminado",
      description: "El proveedor ha sido eliminado correctamente",
    });
  };

  const getSupplier = (id: number) => {
    return suppliers.find((supplier) => supplier.id === id);
  };

  const searchSuppliers = (term: string) => {
    if (!term) {
      // Si no hay término de búsqueda, devolver todos los proveedores ordenados por fecha
      return [...suppliers].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const searchTerm = term.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.email.toLowerCase().includes(searchTerm) ||
        supplier.phone.toLowerCase().includes(searchTerm) ||
        (supplier.contactPerson &&
          supplier.contactPerson.toLowerCase().includes(searchTerm))
    );
  };

  return (
    <SuppliersContext.Provider
      value={{
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplier,
        searchSuppliers,
      }}
    >
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const context = useContext(SuppliersContext);
  if (context === undefined) {
    throw new Error("useSuppliers must be used within a SuppliersProvider");
  }
  return context;
}
