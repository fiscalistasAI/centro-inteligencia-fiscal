import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config";

/**
 * Marca del producto. El nombre viene de la configuración, así que un
 * cambio de branding no toca ningún componente.
 */
export function BrandMark({
  className,
  showName = true,
}: {
  className?: string;
  showName?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-lg"
      >
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none">
          <path
            d="M4 19V9m5 10V5m5 14v-7m5 7V8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showName ? (
        <span className="text-sidebar-foreground text-[0.9375rem] leading-tight font-semibold tracking-tight">
          {APP_NAME}
        </span>
      ) : null}
    </div>
  );
}
