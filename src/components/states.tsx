import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Estado vacío: siempre con una acción concreta, nunca sólo un mensaje. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-card/50 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="bg-accent text-accent-foreground mb-4 grid size-11 place-items-center rounded-full">
          <Icon className="size-5" />
        </span>
      ) : null}
      <h2 className="text-base font-semibold text-balance">{title}</h2>
      {description ? (
        <p className="text-muted-foreground mt-2 max-w-md text-sm text-pretty">
          {description}
        </p>
      ) : null}
      {actionLabel && actionHref ? (
        <Button asChild className="mt-6">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Algo salió mal",
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-destructive/30 bg-destructive/5 flex flex-col items-center rounded-xl border px-6 py-12 text-center",
        className,
      )}
    >
      <AlertTriangle className="text-destructive mb-3 size-6" />
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? (
        <p className="text-muted-foreground mt-2 max-w-md text-sm text-pretty">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
