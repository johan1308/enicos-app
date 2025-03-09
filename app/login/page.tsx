"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      if (email === "admin@enicos.com" && password === "password") {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo a ENICOS",
        })
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: "Correo electrónico o contraseña inválidos",
        })
      }
    }, 1000)
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-950 to-purple-900">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className=" relative mb-4">
            <Image src="/logo.png" alt="ENICOS Logo" width={268} height={368} className="" priority />
          </div>
            <CardDescription className="text-center">Ingrese sus credenciales para acceder a su cuenta</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Usuario</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@enicos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-purple-900 hover:bg-purple-800" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground mt-4">
            © 2025 ENICOS UNEXCA, Inc. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

