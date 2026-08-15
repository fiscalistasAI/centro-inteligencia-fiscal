import { ChartNoAxesCombined, FileText } from "lucide-react";
import { appConfig } from "@/lib/config";

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-10 shrink-0 place-items-center rounded-[10px] bg-primary text-white">
        <FileText className="size-5" aria-hidden="true" />
        <ChartNoAxesCombined className="absolute bottom-1 right-1 size-3" aria-hidden="true" />
      </div>
      {!compact && <span className="max-w-36 text-sm font-bold leading-tight text-ink">{appConfig.name}</span>}
    </div>
  );
}
