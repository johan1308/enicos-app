"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Package,
  BarChart3,
  Users,
  UserCircle,
} from "lucide-react";

const routes = [
  {
    label: "Vender",
    icon: ShoppingBag,
    href: "/dashboard/sell",
    color: "text-purple-300",
  },
  {
    label: "Inventario",
    icon: Package,
    href: "/dashboard/inventory",
    color: "text-purple-300",
  },
  {
    label: "Ventas",
    icon: BarChart3,
    href: "/dashboard/sales",
    color: "text-purple-300",
  },
  {
    label: "Clientes",
    icon: UserCircle,
    href: "/dashboard/clients",
    color: "text-purple-300",
  },
  {
    label: "Proveedores",
    icon: Users,
    href: "/dashboard/suppliers",
    color: "text-purple-300",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-purple-950 text-white dark:bg-background">
      <div className="flex h-14 items-center border-b border-purple-800 px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="text-xl font-bold text-purple-300">MENU</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2 dark:bg-background">
        <nav className="grid items-start px-4 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-white",
                pathname === route.href
                  ? "bg-purple-900 text-white"
                  : "text-purple-300 hover:bg-purple-900/50"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
