"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Menu, Upload } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { demoCompany } from "@/lib/demo-data";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center gap-3 border-b border-border bg-white/95 px-4 backdrop-blur-sm sm:px-6">
          <button className="grid size-11 shrink-0 place-items-center rounded-[10px] text-muted hover:bg-surface lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Menu className="size-5" /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold sm:text-base">{demoCompany.legalName}</p>
            <p className="truncate text-xs text-muted">RFC: {demoCompany.rfc}</p>
          </div>
          <label className="hidden items-center gap-2 rounded-[10px] border border-border bg-white px-3 text-sm text-muted md:flex">
            <CalendarDays className="size-4" aria-hidden="true" />
            <span className="sr-only">Periodo</span>
            <select className="h-10 bg-transparent pr-2 text-ink focus:outline-none" defaultValue="12m">
              <option value="6m">Últimos 6 meses</option><option value="12m">Últimos 12 meses</option><option value="current">Año actual</option><option value="previous">Año anterior</option>
            </select>
          </label>
          <Button asChild className="shrink-0"><Link href="/subir"><Upload className="size-4" /><span className="hidden sm:inline">Subir declaración</span><span className="sm:hidden">Subir</span></Link></Button>
        </header>
        <main id="main-content" className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
