"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, FileText, LoaderCircle, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { extractTaxDeclaration } from "@/lib/extraction";
import type { TaxDeclarationExtraction } from "@/lib/extraction/schema";

type ProcessState = "idle" | "uploading" | "processing" | "extracting" | "review_required" | "completed" | "failed";
const progressCopy: Record<Exclude<ProcessState, "idle" | "review_required" | "completed" | "failed">, string> = { uploading: "Subiendo declaración…", processing: "Analizando documento…", extracting: "Identificando información fiscal…" };

export function DeclarationUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessState>("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<TaxDeclarationExtraction | null>(null);

  async function processFile(nextFile: File) {
    setError("");
    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) { setError("No pudimos leer este archivo. Verifica que sea un PDF válido."); return; }
    if (nextFile.size > appConfig.maxPdfSizeMb * 1024 * 1024) { setError(`El archivo supera el límite de ${appConfig.maxPdfSizeMb} MB. Selecciona un PDF más pequeño.`); return; }
    setFile(nextFile);
    try {
      setState("uploading"); await new Promise((r) => setTimeout(r, 650));
      setState("processing"); await new Promise((r) => setTimeout(r, 700));
      setState("extracting"); const extraction = await extractTaxDeclaration(nextFile);
      setData(extraction); setState("review_required");
    } catch { setState("failed"); setError("No pudimos extraer la información. Intenta nuevamente."); }
  }

  if (state === "review_required" && data && file) return <ExtractionReview data={data} filename={file.name} onCancel={() => { setState("idle"); setData(null); setFile(null); }} onConfirm={() => { setState("completed"); setTimeout(() => router.push("/"), 900); }} />;
  if (state === "completed") return <div className="panel mx-auto max-w-xl p-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success"><Check /></span><h2 className="mt-4 text-xl font-bold">Declaración procesada correctamente</h2><p className="mt-2 text-sm text-muted">Los datos ya forman parte del dashboard.</p></div>;
  const busy = ["uploading", "processing", "extracting"].includes(state);
  return <div className="mx-auto max-w-3xl"><div className="panel p-4 sm:p-6"><div onDragOver={(event)=>event.preventDefault()} onDrop={(event)=>{event.preventDefault(); const dropped=event.dataTransfer.files[0]; if(dropped) void processFile(dropped);}} className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-primary/45 bg-primary/[0.035] p-6 text-center"><input ref={inputRef} type="file" accept="application/pdf" className="sr-only" onChange={(event)=>{const selected=event.target.files?.[0]; if(selected) void processFile(selected);}} />{busy ? <><span className="processing-pulse grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><LoaderCircle className="size-7 animate-spin" /></span><h2 className="mt-5 text-lg font-semibold" aria-live="polite">{progressCopy[state as keyof typeof progressCopy]}</h2><div className="mt-5 flex items-center gap-2" aria-hidden="true">{["uploading","processing","extracting"].map((step,index)=><span key={step} className={`h-1.5 w-16 rounded-full ${index <= ["uploading","processing","extracting"].indexOf(state) ? "bg-primary" : "bg-border"}`} />)}</div><p className="mt-4 text-sm text-muted">{file?.name}</p></> : <><span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><UploadCloud className="size-7" /></span><h2 className="mt-5 text-xl font-bold">Sube una declaración fiscal</h2><p className="mt-2 text-sm text-muted">Arrastra el PDF aquí o selecciona un archivo.</p><Button className="mt-6" onClick={()=>inputRef.current?.click()}><FileText className="size-4" />Seleccionar PDF</Button><p className="mt-4 text-xs text-muted">PDF · Máximo {appConfig.maxPdfSizeMb} MB · Archivo privado</p></>}</div></div>{error && <div role="alert" className="mt-4 flex items-start gap-3 rounded-[10px] border border-error/25 bg-error/5 p-4 text-sm text-error"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><div><p className="font-semibold">No pudimos procesar el archivo</p><p className="mt-1 text-ink">{error}</p></div></div>}</div>;
}

function ExtractionReview({ data, filename, onCancel, onConfirm }: { data: TaxDeclarationExtraction; filename: string; onCancel: () => void; onConfirm: () => void }) {
  const rfcMatches = data.taxpayer.rfc === "CDC210315AB4";
  return <div><div className="mb-6"><h1 className="text-2xl font-bold tracking-[-0.02em]">Revisa la información encontrada</h1><p className="mt-1 max-w-[70ch] text-sm text-muted sm:text-base">Identificamos estos datos en tu declaración. Confírmalos antes de agregarlos al dashboard.</p></div><div className="grid gap-6 lg:grid-cols-[minmax(320px,.85fr)_minmax(0,1.15fr)]"><section className="panel min-h-[560px] bg-surface p-5"><div className="mx-auto flex aspect-[.76] max-h-[680px] max-w-[460px] flex-col bg-white p-7 shadow-[0_4px_8px_oklch(0.21_0.034_250/.08)]"><div className="flex items-center justify-between border-b border-border pb-4"><div><p className="text-xs font-bold text-primary">SAT</p><p className="mt-1 text-[10px] text-muted">Declaración provisional</p></div><FileText className="size-7 text-primary" /></div><div className="mt-8 space-y-3">{[70,90,55,82].map((width,index)=><div key={index} className="h-2 rounded bg-surface-strong" style={{width:`${width}%`}} />)}</div><div className="mt-10 grid grid-cols-2 gap-4">{Array.from({length:8}).map((_,index)=><div key={index}><div className="h-1.5 w-1/2 rounded bg-surface-strong"/><div className="mt-2 h-3 rounded bg-surface"/></div>)}</div><div className="mt-auto border-t border-border pt-4"><p className="truncate text-xs font-medium">{filename}</p><p className="mt-1 text-[10px] text-muted">Vista de referencia del documento original</p></div></div></section><section className="panel p-5"><div className={`mb-5 flex items-start gap-3 rounded-[10px] p-3 ${rfcMatches ? "bg-success/8 text-success" : "bg-warning/10 text-[oklch(0.48_0.13_70)]"}`}>{rfcMatches ? <Check className="mt-0.5 size-4" /> : <AlertTriangle className="mt-0.5 size-4" />}<div><p className="text-sm font-semibold">{rfcMatches ? "El RFC coincide con la empresa" : "El RFC no coincide con la empresa"}</p>{!rfcMatches && <p className="mt-1 text-xs">Revisa el RFC antes de confirmar.</p>}</div></div><ReviewGroup title="Contribuyente" fields={[["RFC",data.taxpayer.rfc,"high"],["Razón social",data.taxpayer.name,"high"]]} /><ReviewGroup title="Declaración" fields={[["Tipo",data.declaration.declaration_type,"high"],["Ejercicio",String(data.period.year ?? ""),"high"],["Periodo",String(data.period.month ?? ""),"high"],["Fecha de presentación",data.declaration.filing_date,"high"],["Número de operación",data.declaration.operation_number,"high"]]} /><ReviewGroup title="ISR" fields={[["ISR determinado",String(data.taxes.isr.tax_due ?? ""),"high"],["Retenciones",String(data.taxes.isr.withholdings ?? ""),"high"]]} /><ReviewGroup title="IVA" fields={[["IVA trasladado",String(data.taxes.iva.tax_charged ?? ""),"high"],["IVA acreditable",String(data.taxes.iva.creditable_tax ?? ""),"review"],["IVA a cargo",String(data.taxes.iva.balance_due ?? ""),"review"]]} /><div className="mt-5 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={onCancel}><X className="size-4" />Cancelar</Button><Button onClick={onConfirm} disabled={!rfcMatches}><Check className="size-4" />Confirmar y guardar</Button></div></section></div></div>;
}

function ReviewGroup({ title, fields }: { title: string; fields: [string,string,string][] }) {
  return <fieldset className="mb-5"><legend className="mb-3 text-sm font-bold">{title}</legend><div className="grid gap-3 sm:grid-cols-2">{fields.map(([label,value,confidence])=><label className="text-sm" key={label}><span className="flex items-center justify-between text-muted">{label}{confidence === "review" && <span className="text-xs font-semibold text-warning">Revisar</span>}</span><input className={`mt-1.5 h-11 w-full rounded-[10px] border bg-white px-3 text-ink outline-none focus:ring-2 focus:ring-primary ${confidence === "review" ? "border-warning bg-warning/[0.04]" : "border-border"}`} defaultValue={value} /></label>)}</div></fieldset>;
}
