"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; success?: string } | null;

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false") redirect("/");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "No pudimos iniciar sesión. Revisa tu correo y contraseña." };
  redirect("/");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false") redirect("/");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: "No pudimos crear la cuenta. Verifica los datos e intenta nuevamente." };
  if (!data.session) return { success: "Cuenta creada. Revisa tu correo para confirmar el acceso." };
  redirect("/");
}
