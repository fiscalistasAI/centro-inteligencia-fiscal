import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
