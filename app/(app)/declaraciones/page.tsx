import { DeclarationTable } from "@/components/declaration-table";

export default function DeclarationsPage() {
  return <div className="flex flex-col gap-6"><div><h1 className="text-2xl font-bold tracking-[-0.02em] sm:text-[2rem]">Declaraciones</h1><p className="mt-1 text-sm text-muted sm:text-base">Consulta los documentos procesados y los que requieren revisión.</p></div><section className="panel overflow-hidden"><DeclarationTable /></section></div>;
}
