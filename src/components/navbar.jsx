"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, BarChart2, PlusCircle } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Suivi d'Objectifs</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-1">
            <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Link>
            </Button>
            <Button variant={pathname === "/statistics" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/statistics">
                <BarChart2 className="mr-2 h-4 w-4" />
                Statistiques
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/add-objective">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un objectif
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
