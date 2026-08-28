"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { createCompany, type CompanyFormState } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeRfc } from "@/lib/tax/rfc";

export function CompanyDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [rfc, setRfc] = useState("");
  const [state, action, pending] = useActionState<CompanyFormState, FormData>(
    createCompany,
    null,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            Agregar empresa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva empresa</DialogTitle>
          <DialogDescription>
            La información fiscal se mantiene separada por empresa.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="legal_name">Razón social</Label>
            <Input
              id="legal_name"
              name="legal_name"
              placeholder="Comercializadora del Norte SA de CV"
              required
            />
            {state?.fieldErrors?.legal_name ? (
              <p className="text-destructive text-sm">{state.fieldErrors.legal_name}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              name="rfc"
              value={rfc}
              onChange={(event) => setRfc(normalizeRfc(event.target.value))}
              className="font-mono uppercase"
              placeholder="CDN180312AB1"
              maxLength={13}
              required
            />
            {state?.fieldErrors?.rfc ? (
              <p className="text-destructive text-sm">{state.fieldErrors.rfc}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="trade_name">
                Nombre comercial <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input id="trade_name" name="trade_name" placeholder="Grupo Norte" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tax_regime">
                Régimen fiscal <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input id="tax_regime" name="tax_regime" placeholder="601 — General de Ley" />
            </div>
          </div>

          {state?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              Guardar empresa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
