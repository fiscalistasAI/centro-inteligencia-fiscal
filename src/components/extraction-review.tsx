"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Loader2 } from "lucide-react";

import {
  cancelReview,
  confirmDeclaration,
  type ReviewState,
} from "@/app/(app)/empresas/[companyId]/declaraciones/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CONFIDENCE_LABELS,
  DECLARATION_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  PERIOD_TYPE_LABELS,
  confidenceLevel,
  type ConfidenceLevel,
} from "@/lib/tax/labels";
import { MONTH_NAMES } from "@/lib/tax/format";
import {
  TAX_FIELDS,
  amountToInput,
  type DeclarationFields,
  type TaxAmounts,
} from "@/lib/tax/mapping";
import { normalizeRfc } from "@/lib/tax/rfc";
import { cn } from "@/lib/utils";

type ConfidenceMap = Partial<Record<string, number | null>>;

const LEVEL_STYLES: Record<ConfidenceLevel, string> = {
  high: "hidden",
  review: "text-amber-600 dark:text-amber-400",
  low: "text-destructive",
  unknown: "text-muted-foreground",
};

function ConfidenceHint({ score }: { score: number | null | undefined }) {
  const level = confidenceLevel(score);
  if (level === "high") return null;
  return (
    <span className={cn("text-[0.6875rem] font-medium", LEVEL_STYLES[level])}>
      {CONFIDENCE_LABELS[level]}
    </span>
  );
}

function Field({
  label,
  htmlFor,
  score,
  children,
}: {
  label: string;
  htmlFor: string;
  score?: number | null;
  children: React.ReactNode;
}) {
  const level = confidenceLevel(score);
  const flagged = level === "low" || level === "review";

  return (
    <div
      className={cn(
        "grid gap-1.5 rounded-md p-2 -mx-2",
        flagged && "bg-amber-500/[0.07] ring-1 ring-amber-500/25",
        level === "low" && "bg-destructive/[0.06] ring-destructive/25",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-xs">
          {label}
        </Label>
        <ConfidenceHint score={score} />
      </div>
      {children}
    </div>
  );
}

function NativeSelect({
  id,
  name,
  defaultValue,
  options,
}: {
  id: string;
  name: string;
  defaultValue: string;
  options: Record<string, string>;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      className="border-input bg-transparent dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
    >
      <option value="">Sin dato</option>
      {Object.entries(options).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function ExtractionReview({
  declarationId,
  companyId,
  company,
  fields,
  amounts,
  confidence,
  taxpayerName,
  notes,
  documentUrl,
  fileName,
}: {
  declarationId: string;
  companyId: string;
  company: { legal_name: string; rfc: string };
  fields: DeclarationFields;
  amounts: TaxAmounts;
  confidence: ConfidenceMap;
  taxpayerName: string | null;
  notes: string | null;
  documentUrl: string | null;
  fileName: string | null;
}) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    confirmDeclaration,
    null,
  );
  const [rfc, setRfc] = useState(fields.rfc);

  const rfcMismatch = Boolean(rfc) && normalizeRfc(rfc) !== normalizeRfc(company.rfc);
  const duplicate = state?.duplicateOf ?? null;

  const groups = {
    isr: TAX_FIELDS.filter((f) => f.group === "isr"),
    iva: TAX_FIELDS.filter((f) => f.group === "iva"),
    payment: TAX_FIELDS.filter((f) => f.group === "payment"),
  };

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <input type="hidden" name="declaration_id" value={declarationId} />
      <input type="hidden" name="company_id" value={companyId} />
      {duplicate ? <input type="hidden" name="acknowledge_duplicate" value="1" /> : null}

      {/* Documento original */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card className="overflow-hidden py-0">
          <div className="bg-muted/40 flex items-center gap-2 border-b px-4 py-2.5">
            <FileText className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate text-sm font-medium">
              {fileName ?? "Documento original"}
            </span>
          </div>
          {documentUrl ? (
            <iframe
              src={documentUrl}
              title="Declaración original"
              className="h-[32rem] w-full bg-white lg:h-[42rem]"
            />
          ) : (
            <div className="text-muted-foreground grid h-96 place-items-center text-sm">
              No pudimos abrir el documento.
            </div>
          )}
        </Card>
      </div>

      {/* Datos extraídos */}
      <div className="space-y-5">
        {rfcMismatch ? (
          <div className="border-destructive/40 bg-destructive/5 flex items-start gap-3 rounded-lg border p-3.5">
            <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" />
            <p className="text-sm text-pretty">
              El RFC de esta declaración no coincide con el RFC de la empresa
              seleccionada (<span className="font-mono">{company.rfc}</span>).
            </p>
          </div>
        ) : rfc ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/5 p-3.5">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm">El RFC coincide con la empresa seleccionada.</p>
          </div>
        ) : null}

        {duplicate ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-pretty">
              Parece que esta declaración ya fue registrada ({duplicate.label}). Si
              confirmas de nuevo, se guardará como un registro adicional.
            </p>
          </div>
        ) : null}

        {notes ? (
          <div className="bg-muted/50 text-muted-foreground rounded-lg p-3.5 text-sm text-pretty">
            <span className="text-foreground font-medium">Nota de la lectura: </span>
            {notes}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contribuyente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Field label="RFC" htmlFor="rfc" score={confidence.rfc}>
              <Input
                id="rfc"
                name="rfc"
                value={rfc}
                onChange={(event) => setRfc(normalizeRfc(event.target.value))}
                className="font-mono uppercase"
                maxLength={13}
              />
            </Field>
            {taxpayerName ? (
              <div className="grid gap-1.5">
                <span className="text-muted-foreground text-xs">
                  Denominación en el documento
                </span>
                <p className="text-sm">{taxpayerName}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Declaración</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label="Tipo de documento" htmlFor="document_type" score={confidence.document_type}>
              <NativeSelect
                id="document_type"
                name="document_type"
                defaultValue={fields.document_type}
                options={DOCUMENT_TYPE_LABELS}
              />
            </Field>

            <Field label="Tipo de declaración" htmlFor="declaration_type" score={confidence.declaration_type}>
              <NativeSelect
                id="declaration_type"
                name="declaration_type"
                defaultValue={fields.declaration_type}
                options={DECLARATION_TYPE_LABELS}
              />
            </Field>

            <Field label="Ejercicio" htmlFor="year" score={confidence.year}>
              <Input
                id="year"
                name="year"
                type="number"
                inputMode="numeric"
                min={1990}
                max={2100}
                defaultValue={fields.year}
              />
            </Field>

            <Field label="Periodo" htmlFor="month" score={confidence.month}>
              <select
                id="month"
                name="month"
                defaultValue={fields.month}
                className="border-input bg-transparent dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              >
                <option value="">Sin mes (anual)</option>
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de periodo" htmlFor="period_type" score={null}>
              <NativeSelect
                id="period_type"
                name="period_type"
                defaultValue={fields.period_type}
                options={PERIOD_TYPE_LABELS}
              />
            </Field>

            <Field label="Fecha de presentación" htmlFor="filing_date" score={confidence.filing_date}>
              <Input
                id="filing_date"
                name="filing_date"
                type="date"
                defaultValue={fields.filing_date}
              />
            </Field>

            <Field
              label="Número de operación"
              htmlFor="operation_number"
              score={confidence.operation_number}
            >
              <Input
                id="operation_number"
                name="operation_number"
                defaultValue={fields.operation_number}
                className="font-mono"
              />
            </Field>
          </CardContent>
        </Card>

        {(["isr", "iva", "payment"] as const).map((group) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle className="text-sm">
                {group === "isr" ? "ISR" : group === "iva" ? "IVA" : "Pago"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {groups[group].map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  htmlFor={field.key}
                  score={confidence[field.key]}
                >
                  <Input
                    id={field.key}
                    name={field.key}
                    inputMode="decimal"
                    placeholder="Sin dato"
                    defaultValue={amountToInput(amounts[field.key])}
                    className="text-right tabular-nums"
                  />
                </Field>
              ))}
            </CardContent>
          </Card>
        ))}

        <p className="text-muted-foreground text-xs text-pretty">
          Deja un campo vacío si el documento no trae ese dato. Un cero significa que
          el documento imprime cero.
        </p>

        {state?.error ? (
          <p role="alert" className="text-destructive text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="bg-background sticky bottom-0 flex flex-wrap gap-2 border-t py-4">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {duplicate ? "Guardar de todas formas" : "Confirmar y guardar"}
          </Button>
          <Button type="submit" variant="outline" formAction={cancelReview}>
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}
