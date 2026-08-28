"use client";

import { AlertTriangle, Check, Loader2 } from "lucide-react";

import { PROCESSING_STAGES, type ProcessingStage } from "@/lib/tax/labels";
import { cn } from "@/lib/utils";

const ACTIVE_STAGES: ProcessingStage[] = ["uploading", "processing", "extracting"];

/**
 * Nunca dejamos al usuario frente a un spinner sin contexto: cada etapa
 * dice qué está pasando con su documento.
 */
export function UploadProgress({
  stage,
  fileName,
  errorMessage,
}: {
  stage: ProcessingStage;
  fileName?: string;
  errorMessage?: string;
}) {
  const failed = stage === "failed";
  const currentIndex = ACTIVE_STAGES.indexOf(stage);

  return (
    <div className="border-border bg-card rounded-xl border p-6">
      {fileName ? (
        <p className="text-muted-foreground mb-5 truncate text-sm">{fileName}</p>
      ) : null}

      {failed ? (
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">No pudimos procesar esta declaración.</p>
            {errorMessage ? (
              <p className="text-muted-foreground mt-1 text-sm text-pretty">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <ol className="space-y-3.5">
          {ACTIVE_STAGES.map((id, index) => {
            const label = PROCESSING_STAGES.find((s) => s.id === id)!.label;
            const done = currentIndex > index || currentIndex === -1;
            const active = currentIndex === index;

            return (
              <li key={id} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border",
                    done && "bg-primary border-primary text-primary-foreground",
                    active && "border-primary text-primary",
                    !done && !active && "border-border text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="size-3.5" />
                  ) : active ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <span className="bg-muted-foreground/40 size-1.5 rounded-full" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    active ? "font-medium" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
