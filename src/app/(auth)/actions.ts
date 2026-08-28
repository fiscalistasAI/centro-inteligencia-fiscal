"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null; message: string | null } | null;

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  // Sólo rutas internas: evita redirecciones abiertas hacia otro dominio.
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Escribe tu correo y contraseña.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error:
        error.status === 400
          ? "Correo o contraseña incorrectos."
          : "No pudimos iniciar sesión. Intenta nuevamente.",
      message: null,
    };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password) {
    return { error: "Escribe tu correo y una contraseña.", message: null };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres.", message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || null } },
  });

  if (error) {
    return {
      error:
        error.message.toLowerCase().includes("already")
          ? "Ya existe una cuenta con este correo."
          : "No pudimos crear la cuenta. Intenta nuevamente.",
      message: null,
    };
  }

  // Con confirmación de correo activada no hay sesión todavía.
  if (!data.session) {
    return {
      error: null,
      message: "Te enviamos un correo para confirmar tu cuenta.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
