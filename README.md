# Centro de Inteligencia Fiscal

MVP de una aplicación SaaS que transforma declaraciones fiscales en datos estructurados, revisables y visuales.

## Inicio rápido

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. El modo demo está activo por defecto y contiene 12 meses de información ficticia.

## Configuración de Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/20260814000000_initial_schema.sql` mediante el flujo de migraciones del proyecto.
3. Copia `.env.example` a `.env.local` y completa la URL y publishable key.
4. Cambia `NEXT_PUBLIC_DEMO_MODE=false` para activar la protección de rutas.

La migración crea tablas, índices, RLS y el bucket privado `tax-declarations`. Las rutas de archivos siguen `{user_id}/{company_id}/{year}/{filename}`.

## Extracción

La UI depende exclusivamente de `extractTaxDeclaration()` y de un schema Zod. El proveedor incluido es determinístico para demostración. Para conectar un modelo multimodal, implementa `TaxDeclarationExtractor` sin modificar los componentes.

## Verificación

```bash
npm test
npm run lint
npm run build
```

## Despliegue

Importa el repositorio en Vercel, configura las variables de `.env.example` y despliega. No uses una service-role key en variables `NEXT_PUBLIC_*`.
