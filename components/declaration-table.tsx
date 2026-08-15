import Link from "next/link";
import { Download, Eye, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { demoDeclarations } from "@/lib/demo-data";
import { money } from "@/lib/utils";

const status = {
  completed: { label: "Procesada", className: "bg-success/10 text-success" },
  review_required: { label: "Pendiente de revisión", className: "bg-warning/10 text-[oklch(0.5_0.14_70)]" },
  failed: { label: "Error", className: "bg-error/10 text-error" },
};

export function DeclarationTable({ compact = false }: { compact?: boolean }) {
  const rows = compact ? demoDeclarations.slice(0, 5) : demoDeclarations;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead className="border-y border-border bg-surface text-xs font-semibold text-muted"><tr><th className="px-5 py-3">Periodo</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Presentación</th><th className="px-4 py-3 text-right">ISR</th><th className="px-4 py-3 text-right">IVA</th><th className="px-4 py-3 text-right">Total pagado</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right"><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => <tr key={row.id} className="hover:bg-surface/60"><td className="whitespace-nowrap px-5 py-3.5 font-semibold">{row.period}</td><td className="px-4 py-3.5">{row.declarationType}</td><td className="whitespace-nowrap px-4 py-3.5 text-muted">{row.filingDate}</td><td className="tabular px-4 py-3.5 text-right">{row.isr == null ? "—" : money.format(row.isr)}</td><td className="tabular px-4 py-3.5 text-right">{row.iva == null ? "—" : money.format(row.iva)}</td><td className="tabular px-4 py-3.5 text-right font-semibold">{row.totalPaid == null ? "—" : money.format(row.totalPaid)}</td><td className="px-4 py-3.5"><Badge className={status[row.status].className}>{status[row.status].label}</Badge></td><td className="px-4 py-3.5"><div className="flex justify-end"><Link className="grid size-10 place-items-center rounded-[10px] text-muted hover:bg-surface hover:text-primary" href={`/declaraciones/${row.id}`} aria-label={`Ver declaración de ${row.period}`}><Eye className="size-4" /></Link><button className="grid size-10 place-items-center rounded-[10px] text-muted hover:bg-surface hover:text-primary" aria-label={`Descargar declaración de ${row.period}`}><Download className="size-4" /></button><button className="grid size-10 place-items-center rounded-[10px] text-muted hover:bg-surface hover:text-ink" aria-label={`Más acciones para ${row.period}`}><MoreHorizontal className="size-4" /></button></div></td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
