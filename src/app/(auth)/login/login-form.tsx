"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { signIn, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicia sesión</CardTitle>
        <CardDescription>
          Accede a la información fiscal de tus empresas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}

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
              autoComplete="current-password"
              required
            />
          </div>

          {state?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" disabled={pending} className="mt-1 w-full">
            {pending ? <Loader2 className="animate-spin" /> : null}
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
