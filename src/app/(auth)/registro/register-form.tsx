"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { signUp, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, null);

  if (state?.message) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="text-primary size-8" />
          <p className="font-medium">Revisa tu correo</p>
          <p className="text-muted-foreground text-sm text-balance">{state.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>
          La información de tus empresas es privada y sólo tuya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Nombre</Label>
            <Input
              id="full_name"
              name="full_name"
              autoComplete="name"
              placeholder="Nombre y apellido"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@despacho.mx"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="text-muted-foreground text-xs">Mínimo 8 caracteres.</p>
          </div>

          {state?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" disabled={pending} className="mt-1 w-full">
            {pending ? <Loader2 className="animate-spin" /> : null}
            Crear cuenta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
