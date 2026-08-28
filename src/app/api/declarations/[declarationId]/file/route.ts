import { NextResponse } from "next/server";

import { STORAGE_BUCKET } from "@/lib/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * Redirige a una URL firmada del PDF original. El bucket es privado: sin
 * sesión válida no hay enlace, y el enlace expira.
 */
export async function GET(
  request: Request,
  context: RouteContext<"/api/declarations/[declarationId]/file">,
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { declarationId } = await context.params;
  const supabase = await createClient();

  const { data: declaration } = await supabase
    .from("declarations")
    .select("file_path, file_name")
    .eq("id", declarationId)
    .maybeSingle();

  if (!declaration?.file_path) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("descargar") === "1";

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(declaration.file_path, 60 * 5, {
      download: download ? (declaration.file_name ?? "declaracion.pdf") : undefined,
    });

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
