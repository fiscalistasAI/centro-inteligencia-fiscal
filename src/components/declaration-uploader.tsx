"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileUp } from "lucide-react";

import { UploadProgress } from "@/components/upload-progress";
import { Button } from "@/components/ui/button";
import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/config";
import { USER_ERRORS, type ProcessingStage } from "@/lib/tax/labels";
import { formatFileSize } from "@/lib/tax/format";
import { cn } from "@/lib/utils";

type ErrorKey = keyof typeof USER_ERRORS;

function messageFor(key: string | undefined): string {
  return USER_ERRORS[(key as ErrorKey) ?? "generic"] ?? USER_ERRORS.generic;
}

export function DeclarationUploader({ companyId }: { companyId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<ProcessingStage | null>(null);
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);

    if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
      setStage(null);
      setError(USER_ERRORS.invalid_pdf);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setStage(null);
      setError(
        `${USER_ERRORS.too_large} El máximo es ${MAX_UPLOAD_MB} MB y este archivo pesa ${formatFileSize(file.size)}.`,
      );
      return;
    }

    setStage("uploading");

    const body = new FormData();
    body.set("company_id", companyId);
    body.set("file", file);

    let declarationId: string;
    try {
      const response = await fetch("/api/declarations", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) {
        setStage("failed");
        setError(messageFor(payload?.error));
        return;
      }
      declarationId = payload.declarationId;
    } catch {
      setStage("failed");
      setError(USER_ERRORS.generic);
      return;
    }

    setStage("processing");
    // Pausa breve para que la etapa "Analizando documento" sea legible
    // antes de que arranque la extracción.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setStage("extracting");

    try {
      const response = await fetch(`/api/declarations/${declarationId}/extract`, {
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        setStage("failed");
        setError(messageFor(payload?.error));
        return;
      }

      setStage("review_required");
      router.push(payload.reviewUrl);
    } catch {
      setStage("failed");
      setError(USER_ERRORS.extraction_failed);
    }
  }

  function reset() {
    setStage(null);
    setError(null);
    setFileName(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (stage && stage !== "failed") {
    return <UploadProgress stage={stage} fileName={fileName} />;
  }

  if (stage === "failed") {
    return (
      <div className="space-y-4">
        <UploadProgress
          stage="failed"
          fileName={fileName}
          errorMessage={error ?? undefined}
        />
        <Button variant="outline" onClick={reset}>
          Intentar con otro archivo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors",
          dragging ? "border-primary bg-accent/60" : "border-border bg-card/50",
        )}
      >
        <span className="bg-accent text-accent-foreground mb-5 grid size-12 place-items-center rounded-full">
          <FileUp className="size-6" />
        </span>

        <h2 className="text-lg font-semibold">Sube una declaración fiscal</h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Arrastra el PDF aquí o selecciona un archivo.
        </p>

        <Button className="mt-6" onClick={() => inputRef.current?.click()}>
          Seleccionar archivo
        </Button>

        <p className="text-muted-foreground mt-4 text-xs">
          Sólo PDF · máximo {MAX_UPLOAD_MB} MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
