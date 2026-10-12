# Smile Lab · Estudio de anuncios

App interna para crear anuncios de Meta y Google Ads de Smile Lab Odontología. Escribís un pedido («Dame un reel sobre endodoncia»), Claude devuelve un **AdSpec** (copy, layout, foto, formatos y campos de plataforma), la app lo valida contra las reglas de marca y de publicidad sanitaria, lo renderiza en todos los formatos y arma un paquete descargable: PNG a tamaño real (o MP4 + escenas para reels), `copy.txt` y `ad.json`.

Stack: **Next.js 16 (App Router) + TypeScript** en **Vercel**, **Supabase** (Postgres, Auth, Storage) y la **API de Claude** (`@anthropic-ai/sdk`).

## Estructura

| Ruta | Qué hace |
|---|---|
| `src/components/ad/` | Componentes de anuncio portados del design system (`AdTemplate`, `Logo`, `Headline`, …). Son la fuente de verdad visual: no rediseñar. |
| `src/lib/generate.ts` | Llamada a Claude: system prompt + `<brand>` + `<photos>` (+ `<current_spec>` en refinamientos), herramienta `create_ad` con el schema estricto, y hasta 2 reintentos devolviendo los errores como `tool_result` con `is_error`. |
| `src/lib/validate.ts` | `validateSpec()`: las 9 reglas del checklist (límites, itálica, `!`, patrones prohibidos, voseo, promo → condiciones, foto aprobada, legales, layout). |
| `src/lib/export.tsx` | Exportación en el navegador: cada formato se renderiza a tamaño nativo y se captura (`modern-screenshot`). Reels: escenas compuestas sobre la foto con crossfade de 300 ms y Ken Burns 1.00→1.04, codificadas a H.264 con WebCodecs + `mp4-muxer`. |
| `src/app/api/generate/route.ts` | `POST /api/generate` → SSE con los pasos reales; guarda el anuncio en `ads`. |
| `src/app/(studio)/` | Inicio, resultado (`/ads/[id]`), Historial, Fotos, Ajustes. |
| `design/handoff/` | Paquete de diseño original (referencia). |

## Supabase

Proyecto `adbuilder` (`qbgequcowhkbcltifvye`, sa-east-1). Tablas:

- `settings` — una fila: director, matrícula, sede por defecto, modelo.
- `photos` — biblioteca de fotos (archivo en el bucket público `photos`).
- `ads` — cada anuncio y sus refinamientos (`parent_id`).

**Sin login**: la app no pide credenciales. Cualquiera con la URL puede usarla; las políticas RLS dan acceso completo a la publishable key.

## Variables de entorno

Ver `.env.example`.

| Variable | Dónde |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`) |
| `ANTHROPIC_API_KEY` | Solo servidor. Nunca con prefijo `NEXT_PUBLIC_`. |
| `ANTHROPIC_MODEL` | Opcional; se usa si Ajustes no tiene modelo. |

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar
npm run dev
```

## Notas

- **Exportación en el navegador**: el MP4 necesita un navegador con codificador H.264 en WebCodecs (Chrome, Edge o Safari actualizados). Si no hay, el paquete trae las escenas en PNG y lo avisa en `copy.txt`.
- **Fotos**: solo fotos propias de la clínica y aprobadas. No hay generación de imágenes por IA (regla de marca: publicidad sanitaria).
- **Legales**: confirmar el texto de director odontológico y matrícula con el Colegio Odontológico de Córdoba antes de publicar.
- **Modelo**: Claude Opus 5.5 por defecto, Sonnet 5.5 como opción más rápida (Ajustes). Si el modelo declina un pedido, el servidor reintenta con el fallback que define Anthropic.
