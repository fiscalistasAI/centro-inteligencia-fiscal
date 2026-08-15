"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, LayoutDashboard, LogOut, X } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/declaraciones", label: "Declaraciones", icon: FileText },
  { href: "/empresas", label: "Empresas", icon: Building2 },
];

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-ink/35 lg:hidden" aria-label="Cerrar menú" onClick={onClose} />}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-border bg-surface px-3 py-5 transition-transform duration-200 lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-2">
          <AppLogo />
          <button className="grid size-11 place-items-center rounded-[10px] text-muted hover:bg-surface-strong lg:hidden" onClick={onClose} aria-label="Cerrar menú"><X className="size-5" /></button>
        </div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Navegación principal">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={onClose} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", active ? "bg-white text-primary" : "text-muted hover:bg-white hover:text-ink")}>
                <Icon className="size-[18px]" aria-hidden="true" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-white">MM</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">María Martínez</p><p className="truncate text-xs text-muted">maria@demo.mx</p></div>
          </div>
          <Link href="/login" className="mt-1 flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-muted hover:bg-white hover:text-ink"><LogOut className="size-[18px]" />Cerrar sesión</Link>
        </div>
      </aside>
    </>
  );
}
