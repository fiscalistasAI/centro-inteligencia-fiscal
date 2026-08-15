# Design System

## Direction

Instrumento fiscal contemporáneo: densidad media-alta, lectura rápida y una estructura operacional clara. La banda Documento → Por revisar → Procesadas funciona como firma visual y como orientación del flujo.

## Color

Todos los tokens se expresan en OKLCH. Fondo blanco puro, neutros ligeramente orientados al azul acero y color semántico reservado.

- Primary: `oklch(0.55 0.091 210)`
- Background: `oklch(1 0 0)`
- Surface: `oklch(0.97 0.006 230)`
- Ink: `oklch(0.21 0.034 250)`
- Muted ink: `oklch(0.45 0.025 245)`
- Border: `oklch(0.91 0.01 235)`
- Success: `oklch(0.56 0.14 160)`
- Warning: `oklch(0.67 0.16 70)`
- Error: `oklch(0.58 0.19 27)`

## Typography

Aptos / Segoe UI Variable / SF Pro Text, según la plataforma, en pesos 400, 500, 600 y 700. Esta pila local evita descargas durante el build. Escala fija de producto: 0.75rem, 0.875rem, 1rem, 1.125rem, 1.5rem y 2rem. Los importes usan cifras tabulares.

## Shape and depth

Radios de 8, 10 y 12px. Los paneles usan borde o sombra corta, nunca ambos como decoración. Botones de 10px y badges en píldora.

## Layout

Sidebar de 248px en escritorio, header compacto y área principal con máximo de 1600px. Dashboard en dos columnas 2fr/1fr, convertido en una sola columna en tablet. En móvil la navegación se abre como drawer y las tablas se convierten en listas.

## Motion

Transiciones de estado de 160–220ms con curva de salida. Sin secuencias decorativas. `prefers-reduced-motion` desactiva desplazamientos y reduce transiciones.
