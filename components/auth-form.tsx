"use client";

import { useActionState, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/app/login/actions";

export function AuthForm() {
  const [register, setRegister] = useState(false);
  const [state, action, pending] = useActionState(register ? signUp : signIn, null);
  return <><form action={action} className="mt-8 space-y-5"><label className="block text-sm font-semibold">Correo electrónico<input className="mt-2 h-11 w-full rounded-[10px] border border-border px-3 font-normal outline-none focus:ring-2 focus:ring-primary" type="email" name="email" placeholder="nombre@despacho.mx" autoComplete="email" required /></label><label className="block text-sm font-semibold">Contraseña<input className="mt-2 h-11 w-full rounded-[10px] border border-border px-3 font-normal outline-none focus:ring-2 focus:ring-primary" type="password" name="password" autoComplete={register ? "new-password" : "current-password"} minLength={8} required /></label>{state?.error && <p role="alert" className="rounded-[10px] bg-error/5 p-3 text-sm text-error">{state.error}</p>}{state?.success && <p role="status" className="rounded-[10px] bg-success/10 p-3 text-sm text-success">{state.success}</p>}<Button className="w-full" disabled={pending}>{pending ? "Procesando…" : register ? "Crear cuenta" : "Iniciar sesión"}<ArrowRight className="size-4" /></Button></form><p className="mt-6 text-center text-sm text-muted">{register ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"} <button type="button" onClick={()=>setRegister((value)=>!value)} className="min-h-11 font-semibold text-primary hover:underline">{register ? "Iniciar sesión" : "Crear cuenta"}</button></p></>;
}
