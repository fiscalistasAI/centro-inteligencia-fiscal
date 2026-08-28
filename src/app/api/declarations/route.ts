import { NextResponse } from "next/server";

import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES, STORAGE_BUCKET } from "@/lib/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { currentYearMonth } from "@/lib/tax/periods";

export const maxDuration = 60;

/** Deja el nombre en algo seguro para una ruta de Storage. */
function safeFileName(name: string): string {
  const base = name.replace(/\.pdf$/i, "");
  const slug = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .toLowerCase();
  return `${slug || "declaracion"}.pdf`;
}

/** Sube el PDF y registra la declaración en estado `processing`. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_pdf" }, { status: 400 });
  }

  const companyId = String(formData.get("company_id") ?? "");
  const file = formData.get("file");

  if (!companyId || !(file instanceof File)) {
    return NextResponse.json({ error: "invalid_pdf" }, { status: 400 });
  }

  if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    return NextResponse.json({ error: "invalid_pdf" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "invalid_pdf" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .maybeSingle();

  if (!company) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Un PDF válido empieza con %PDF-. Atajamos aquí los renombrados.
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (header !== "%PDF-") {
    return NextResponse.json({ error: "invalid_pdf" }, { status: 400 });
  }

  const { year } = currentYearMonth();
  const path = `${user.id}/${companyId}/${year}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    console.error("[declarations] upload", uploadError.message);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }

  const { data: declaration, error: insertError } = await supabase
    .from("declarations")
    .insert({
      company_id: companyId,
      user_id: user.id,
      status: "processing",
      file_path: path,
      file_name: file.name,
      file_size: file.size,
    })
    .select("id")
    .single();

  if (insertError || !declaration) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    console.error("[declarations] insert", insertError?.message);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }

  return NextResponse.json({ declarationId: declaration.id });
}
