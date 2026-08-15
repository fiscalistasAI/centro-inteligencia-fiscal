import { CheckCircle2, FileText, ScanSearch } from "lucide-react";

const steps = [
  { label: "Documentos", value: 12, detail: "cargados", icon: FileText, tone: "primary" },
  { label: "Por revisar", value: 1, detail: "pendiente", icon: ScanSearch, tone: "warning" },
  { label: "Procesadas", value: 11, detail: "confirmadas", icon: CheckCircle2, tone: "success" },
] as const;

export function WorkflowSummary() {
  return (
    <section className="grid gap-3 md:grid-cols-3" aria-label="Estado de las declaraciones">
      {steps.map(({ label, value, detail, icon: Icon, tone }, index) => (
        <div key={label} className={`relative flex items-center gap-4 rounded-xl border px-4 py-4 ${tone === "warning" ? "border-warning/35 bg-warning/5" : tone === "success" ? "border-success/30 bg-success/5" : "border-primary/25 bg-primary/5"}`}>
          <span className={`grid size-10 place-items-center rounded-[10px] bg-white ${tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-primary"}`}><Icon className="size-5" /></span>
          <div><p className="text-sm font-medium text-muted">{label}</p><p className="tabular text-2xl font-bold">{value} <span className="text-sm font-normal text-muted">{detail}</span></p></div>
          {index < steps.length - 1 && <span className="absolute -right-2 top-1/2 z-10 hidden size-4 -translate-y-1/2 place-items-center rounded-full border border-border bg-white text-[10px] text-primary md:grid" aria-hidden="true">›</span>}
        </div>
      ))}
    </section>
  );
}
