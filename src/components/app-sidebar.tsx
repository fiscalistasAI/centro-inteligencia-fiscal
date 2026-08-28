"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, LayoutDashboard, LogOut, Menu, Upload } from "lucide-react";
import { useState } from "react";

import { signOut } from "@/app/(auth)/actions";
import { BrandMark } from "@/components/brand-mark";
import { CompanySelector, type CompanyOption } from "@/components/company-selector";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Exacta para el dashboard; por prefijo para las secciones internas. */
  match: (pathname: string) => boolean;
};

/** La empresa activa se deduce de la URL, no de un estado global. */
export function activeCompanyFromPath(pathname: string): string | null {
  return (
    pathname.match(
      /^\/empresas\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    )?.[1] ?? null
  );
}

function buildNav(companyId: string | null): NavItem[] {
  const base = companyId ? `/empresas/${companyId}` : "/dashboard";
  return [
    {
      href: base,
      label: "Dashboard",
      icon: LayoutDashboard,
      match: (p) => (companyId ? p === base : p === "/dashboard"),
    },
    {
      href: companyId ? `${base}/declaraciones` : "/declaraciones",
      label: "Declaraciones",
      icon: FileText,
      match: (p) => p.includes("/declaraciones"),
    },
    {
      href: "/empresas",
      label: "Empresas",
      icon: Building2,
      match: (p) => p === "/empresas",
    },
  ];
}

function SidebarBody({
  companies,
  userLabel,
  onNavigate,
}: {
  companies: CompanyOption[];
  userLabel: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const companyId = activeCompanyFromPath(pathname) ?? companies[0]?.id ?? null;
  const nav = buildNav(companyId);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="px-1 py-1">
        <BrandMark />
      </div>

      {companies.length > 0 ? (
        <CompanySelector
          companies={companies}
          activeCompanyId={companyId}
          className="w-full"
        />
      ) : null}

      {companyId ? (
        <Button asChild size="sm" className="w-full justify-start gap-2">
          <Link href={`/empresas/${companyId}/cargar`} onClick={onNavigate}>
            <Upload className="size-4" />
            Subir declaración
          </Link>
        </Button>
      ) : null}

      <nav className="flex flex-col gap-0.5">
        {nav.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Separator className="mb-3" />
        <p className="text-muted-foreground truncate px-2.5 pb-2 text-xs">{userLabel}</p>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-full justify-start gap-2.5 px-2.5"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AppSidebar({
  companies,
  userLabel,
}: {
  companies: CompanyOption[];
  userLabel: string;
}) {
  return (
    <aside className="bg-sidebar border-sidebar-border sticky top-0 hidden h-dvh w-64 shrink-0 border-r md:block">
      <SidebarBody companies={companies} userLabel={userLabel} />
    </aside>
  );
}

export function MobileHeader({
  companies,
  userLabel,
}: {
  companies: CompanyOption[];
  userLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background/90 border-border sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menú">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar w-72 p-0">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <SheetDescription className="sr-only">
            Secciones y empresas disponibles.
          </SheetDescription>
          <SidebarBody
            companies={companies}
            userLabel={userLabel}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <BrandMark />
    </header>
  );
}
