import { Client } from "@/lib/clients-context";

export const clientInitial:Client[]= [
    {
      id: 1,
      nombre: "Juan",
      apellido: "Perez",
      identificacion: "123456789",
      tipoIdentificacion: "DNI",
      direccion: "Calle Falsa 123",
      telefono: "555-1234",
      email: "juan.perez@example.com",
      createdAt: "2023-01-01T00:00:00Z",
      lastUpdated: null,
    },
    {
      id: 2,
      nombre: "Maria",
      apellido: "Gomez",
      identificacion: "987654321",
      tipoIdentificacion: "DNI",
      direccion: "Avenida Siempre Viva 742",
      telefono: "555-5678",
      email: "maria.gomez@example.com",
      createdAt: "2023-02-01T00:00:00Z",
      lastUpdated: null,
    },
    {
      id: 3,
      nombre: "Carlos",
      apellido: "Lopez",
      identificacion: "456789123",
      tipoIdentificacion: "DNI",
      direccion: "Calle Luna 456",
      telefono: "555-8765",
      email: "carlos.lopez@example.com",
      createdAt: "2023-03-01T00:00:00Z",
      lastUpdated: null,
    },
    {
      id: 4,
      nombre: "Ana",
      apellido: "Martinez",
      identificacion: "321654987",
      tipoIdentificacion: "DNI",
      direccion: "Calle Sol 789",
      telefono: "555-4321",
      email: "ana.martinez@example.com",
      createdAt: "2023-04-01T00:00:00Z",
      lastUpdated: null,
    }
  ]