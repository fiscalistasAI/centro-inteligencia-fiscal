import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";

import { deleteDeclaration } from "../actions";
import { PageHeader, PageShell } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCompany } from "@/lib/data/companies";
import { getDeclaration } from "@/lib/data/declarations";
import { formatCurrency, formatDate, formatDateTime, formatPeriod } from "@/lib/tax/format";
import {
  DECLARATION_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  PERIOD_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_VARIANTS,
  labelFor,
} from "@/lib/tax/labels";
import { TAX_FIELDS, taxAmountsFromRow } from "@/lib/tax/mapping";

export const metadata: Metadata = { title: "Declaración" };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function DeclarationDetailPage({
  params,
}: PageProps<"/empresas/[companyId]/declaraciones/[declarationId]">) {
  const { companyId, declarationId } = await params;

  const [company, declaration] = await Promise.all([
    getCompany(companyId),
    getDeclaration(declarationId),
  ]);

  if (!company || !declaration || declaration.company_id !== companyId) notFound();

  const amounts = taxAmountsFromRow(declaration.tax);
  const groups = {
    ISR: TAX_FIELDS.filter((f) => f.group === "isr"),
    IVA: TAX_FIELDS.filter((f) => f.group === "iva"),
    Pago: TAX_FIELDS.filter((f) => f.group === "payment"),
  };

  return (
    <PageShell className="max-w-4xl space-y-6">
      <PageHeader
        title={formatPeriod(declaration.year, declaration.month)}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {company.legal_name}
            <Badge variant={STATUS_VARIANTS[declaration.status]}>
              {STATUS_LABELS[declaration.status]}
            </Badge>
            {declaration.rfc_matches === false ? (
              <Badge variant="destructive">RFC distinto</Badge>
            ) : null}
          </span>
        }
        actions={
          declaration.file_path ? (
            <>
              <Button asChild variant="outline">
                <a
                  href={`/api/declarations/${declaration.id}/file`}
                  target="_blank"
                  rel="noopener"
                >
                  <ExternalLink className="size-4" />
                  Ver documento original
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href={`/api/declarations/${declaration.id}/file?descargar=1`}>
                  <Download className="size-4" />
                  Descargar
                </a>
              </Button>
            </>
          ) : null
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información general</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-border divide-y">
              <Row
                label="Tipo de documento"
                value={labelFor(DOCUMENT_TYPE_LABELS, declaration.document_type)}
              />
              <Row
                label="Tipo de declaración"
                value={labelFor(DECLARATION_TYPE_LABELS, declaration.declaration_type)}
              />
              <Row
                label="Tipo de periodo"
                value={labelFor(PERIOD_TYPE_LABELS, declaration.period_type)}
              />
              <Row label="Ejercicio" value={declaration.year ?? "—"} />
              <Row
                label="Fecha de presentación"
                value={formatDate(declaration.filing_date)}
              />
              <Row
                label="Número de operación"
                value={
                  <span className="font-mono">{declaration.operation_number ?? "—"}</span>
                }
              />
              <Row
                label="RFC en el documento"
                value={
                  <span className="font-mono">{declaration.rfc_extracted ?? "—"}</span>
                }
              />
              <Row label="Cargada" value={formatDateTime(declaration.created_at)} />
              <Row label="Archivo" value={declaration.file_name ?? "—"} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Importes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groups).map(([title, fields], index) => (
              <div key={title}>
                {index > 0 ? <Separator className="mb-4" /> : null}
                <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  {title}
                </p>
                <dl className="divide-border divide-y">
                  {fields.map((field) => (
                    <Row
                      key={field.key}
                      label={field.label}
                      value={
                        <span className="tabular-nums">
                          {formatCurrency(amounts[field.key])}
                        </span>
                      }
                    />
                  ))}
                </dl>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {declaration.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Nota de la lectura</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm text-pretty">
              {declaration.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link href={`/empresas/${companyId}/declaraciones`}>
            Volver al historial
          </Link>
        </Button>
        <form action={deleteDeclaration}>
          <input type="hidden" name="declaration_id" value={declaration.id} />
          <input type="hidden" name="company_id" value={companyId} />
          <Button type="submit" variant="outline" className="text-destructive">
            Eliminar declaración
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
