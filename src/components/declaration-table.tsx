"use client";

import Link from "next/link";
import { Download, Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { deleteDeclaration } from "@/app/(app)/empresas/[companyId]/declaraciones/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DeclarationStatus } from "@/lib/supabase/database.types";
import { formatCurrency, formatDate, formatPeriod } from "@/lib/tax/format";
import {
  DECLARATION_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_VARIANTS,
  labelFor,
} from "@/lib/tax/labels";

export type DeclarationTableRow = {
  id: string;
  year: number | null;
  month: number | null;
  declarationType: string | null;
  filingDate: string | null;
  isr: number | null;
  iva: number | null;
  total: number | null;
  status: DeclarationStatus;
  hasFile: boolean;
};

export function DeclarationTable({
  rows,
  companyId,
}: {
  rows: DeclarationTableRow[];
  companyId: string;
}) {
  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Periodo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Presentación</TableHead>
            <TableHead className="text-right">ISR</TableHead>
            <TableHead className="text-right">IVA</TableHead>
            <TableHead className="text-right">Total pagado</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const detailHref =
              row.status === "review_required"
                ? `/empresas/${companyId}/declaraciones/${row.id}/revisar`
                : `/empresas/${companyId}/declaraciones/${row.id}`;

            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatPeriod(row.year, row.month)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {labelFor(DECLARATION_TYPE_LABELS, row.declarationType)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.filingDate)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.isr)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.iva)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(row.total)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[row.status]}>
                    {STATUS_LABELS[row.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Acciones">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={detailHref}>
                          <Eye className="size-4" />
                          Ver
                        </Link>
                      </DropdownMenuItem>
                      {row.hasFile ? (
                        <DropdownMenuItem asChild>
                          <a
                            href={`/api/declarations/${row.id}/file?descargar=1`}
                            target="_blank"
                            rel="noopener"
                          >
                            <Download className="size-4" />
                            Descargar original
                          </a>
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild variant="destructive">
                        <form action={deleteDeclaration}>
                          <input type="hidden" name="declaration_id" value={row.id} />
                          <input type="hidden" name="company_id" value={companyId} />
                          <button type="submit" className="flex w-full items-center gap-2">
                            <Trash2 className="size-4" />
                            Eliminar
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
