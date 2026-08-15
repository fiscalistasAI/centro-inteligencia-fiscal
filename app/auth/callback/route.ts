import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", "No pudimos confirmar tu cuenta. Solicita un enlace nuevo.");
  return NextResponse.redirect(loginUrl);
}
