# Centro de Inteligencia Fiscal

Convierte declaraciones fiscales en PDF en datos estructurados, históricos y
comparables: subes el documento, revisas lo que encontramos y el dashboard se
actualiza solo.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui ·
Supabase (Postgres, Auth, Storage) · Recharts · Vercel.

---

## Puesta en marcha

### 1. Crear el proyecto de Supabase

En [supabase.com](https://supabase.com) crea un proyecto y ejecuta el contenido
de `supabase/migrations/0001_init.sql` en el **SQL Editor**. Eso crea:

- las tablas `profiles`, `companies`, `declarations`, `declaration_tax_data`;
- las políticas de Row Level Security de cada una;
- el trigger que crea el perfil al registrarse un usuario;
- el bucket privado `declarations` con sus políticas de Storage.

Con la CLI de Supabase el equivalente es:

```bash
supabase link --project-ref TU_REF && supabase db push
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y llénalo:

```
NEXT_PUBLIC_SUPABASE_URL=              # Project Settings → API
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # la llave publishable, nunca la secreta
ANTHROPIC_API_KEY=                     # opcional; sin ella se usa el proveedor mock
```

> El repositorio incluye un `.env.local` con valores marcador. **Reemplázalos**:
> mientras digan `REEMPLAZAME` la aplicación arranca pero no puede autenticar.

### 3. Correr en local

```bash
npm install && npm run dev
```

### 4. Probar el flujo sin gastar tokens

Con `EXTRACTION_PROVIDER=mock` (o simplemente sin `ANTHROPIC_API_KEY`) la
extracción devuelve datos ficticios plausibles —incluidos algunos con baja
confianza— para recorrer carga, revisión y dashboard completos.

Para poblar el dashboard de inmediato, en **Empresas → Cargar datos demo** se
crea una empresa marcada `is_demo` con 12 meses de declaraciones. Los periodos
son relativos al mes actual, así que la demo no caduca.

---

## Cómo está organizado

```
src/
  app/
    (auth)/            login, registro y sus server actions
    (app)/             la aplicación con sesión: empresas, dashboard, historial
    api/declarations/  carga del PDF, extracción y descarga firmada
  components/          UI reutilizable (sidebar, KPI, gráficas, revisión…)
  lib/
    ai/                capa de extracción desacoplada del proveedor
    data/              consultas a Supabase
    supabase/          clientes de navegador, servidor y proxy
    tax/               dominio fiscal: esquema, RFC, periodos, agregación, insights
supabase/migrations/   esquema, RLS y Storage
```

### La capa de extracción

Todo el resto de la aplicación conoce una sola función:

```ts
import { extractTaxDeclaration } from "@/lib/ai/extract";
```

Devuelve un `TaxExtraction` validado con Zod contra el esquema de
`src/lib/tax/schema.ts`. Cambiar de proveedor de IA es implementar
`ExtractionProvider` (ver `src/lib/ai/providers/`), registrarlo en
`PROVIDERS` y mover la variable `EXTRACTION_PROVIDER`. Ningún componente de UI
importa el SDK del modelo.

### Dos reglas del dominio que conviene no romper

1. **`null` no es cero.** Un campo que el documento no trae se guarda como
   `null`; un cero impreso se guarda como `0`. La agregación, las gráficas y el
   formato de moneda distinguen los dos casos en todo el recorrido.
2. **La IA propone, la persona confirma.** La extracción deja la declaración en
   `review_required` con sus importes como propuesta. Sólo la pantalla de
   revisión la pasa a `completed`, que es el único estado que alimenta KPI,
   gráficas e insights.

### Seguridad

- RLS activo en las cuatro tablas; las políticas comparan contra
  `(select auth.uid())` y cubren `select`, `insert`, `update` y `delete`.
- El bucket de Storage es privado. Los PDF se sirven mediante URLs firmadas de
  vida corta a través de `/api/declarations/[id]/file`, nunca por enlace público.
- La ruta de cada archivo empieza con el `user_id`, y las políticas de
  `storage.objects` verifican ese primer segmento.

---

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Configura `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   y `ANTHROPIC_API_KEY`.
3. En Supabase → Authentication → URL Configuration, agrega el dominio de
   Vercel a las Redirect URLs.

La extracción corre en `/api/declarations/[id]/extract` con `maxDuration = 60`,
el máximo del plan Hobby. Con documentos largos y un plan Pro puedes subirlo.

---

## Fuera de alcance del MVP

Sin contabilidad electrónica, descarga automática del SAT, e.firma, CIEC, CFDI,
DIOT, cálculo de impuestos ni presentación de declaraciones. La arquitectura no
impide agregarlos: el modelo de datos y la capa de extracción están pensados
para crecer hacia la fase 2, "Pregúntale a tus declaraciones", que consultará
los datos estructurados y no los PDF.
