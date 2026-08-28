import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return (
    <>
      <LoginForm next={typeof next === "string" ? next : undefined} />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="text-primary font-medium hover:underline">
          Crear cuenta
        </Link>
      </p>
    </>
  );
}
