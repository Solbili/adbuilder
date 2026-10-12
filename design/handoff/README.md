# Handoff: Smile Lab — Estudio de anuncios (AI ad generator)

## Overview
Internal web app for Smile Lab Odontología (dental clinic, Córdoba, Argentina). The user types an instruction on the home screen («Dame un reel sobre endodoncia»). The app calls Claude, which returns a structured **AdSpec** (copy, layout, photo, formats, platform fields). The app renders the ad in every requested format using the brand's ad templates, validates it against brand and health-advertising rules, and delivers a downloadable package: images (or MP4 for reels) at real pixel size, plus every text field needed in Meta Ads Manager / Google Ads.

Formats supported (all from `components/templates/AdTemplate.jsx` → `AD_FORMATS`):
- Meta: feed 1080×1080, feed 1080×1350, Stories 1080×1920 (safe 250/250), Reels 1080×1920 (safe 250/420)
- Google: display 1200×628, 1200×1200, 960×1200; Demand Gen 1080×1920; logo 1200×1200 and 1200×300

## About the design files
Everything in this bundle is a **design reference built in HTML/React (in-browser Babel)**. They show the intended look and behavior; they are not production code to copy as is. Recreate them in a real app. No codebase exists yet, so use the stack recommended below unless the team already has one.

The **ad components** (`components/`) are the exception: they are small, dependency-free React components using CSS custom properties. Port them into the app almost as-is (convert to TypeScript, keep every number). They are the source of truth for how each ad looks; do not redesign them.

## Fidelity
**High-fidelity.**
- **Ad renders:** pixel-final. Exact colors, type and spacing come from the components.
- **App screens** (`prototype/Ad Studio.html`): hi-fi in look, built with the same tokens and components. Interaction details beyond what's shown are up to the developer, as long as they stay inside the system.

---

## Recommended architecture
- **Next.js (App Router) + TypeScript.** The Anthropic key lives only on the server (`ANTHROPIC_API_KEY`). It is never shipped to the browser.
- **Generation:** `POST /api/generate` → Anthropic Messages API.
  - `system` = `prompts/system-prompt.md` + runtime blocks (`<brand>`, `<photos>`, `<current_spec>`).
  - One tool, `create_ad`, with `input_schema` = `schema/ad-spec.schema.json` and `tool_choice: { type: "tool", name: "create_ad" }`.
  - Model from env (`ANTHROPIC_MODEL`); use the current Claude Sonnet-class model.
  - Stream status to the client (SSE) to drive the progress steps.
- **Validation (server, deterministic):** after the tool call, run `validateSpec()` (rules below). On failure, send the errors back to Claude as a `tool_result` with `is_error: true` and ask for a corrected call. Retry at most 2 times, then return the spec with the failed checks flagged.
- **Preview:** render `<AdTemplate>` client-side, scaled with CSS `transform: scale()` inside a fixed-size wrapper. Always render at native size and scale the wrapper; never re-layout at preview size.
- **Export:**
  - **PNG:** a headless-browser route (`/render/[adId]/[format]/[frame]`) renders one `<AdTemplate>` at native size on a blank page. Playwright screenshots it with `deviceScaleFactor: 1`, viewport = format size, waiting for `document.fonts.ready`. Output is PNG/JPG under 30 MB (Meta) or 5 MB (Google; compress to JPG 85 if needed).
  - **Reels MP4:** Remotion (or ffmpeg over the per-scene PNGs). 1080×1920, 30 fps, H.264. Each `frames[i]` is a scene of `durationSec`, with a 300 ms crossfade between scenes and a slow 1.00→1.04 photo scale (Ken Burns) per scene. No other motion and no audio baked in (the audio is a suggestion in the package).
  - **Package (.zip):** `/{format}.png` (or `/scene-{n}.png` + `reel.mp4`), `copy.txt` (human-readable, field by field, in Ads Manager order), `ad.json` (the AdSpec + render metadata).
- **Storage:** SQLite/Postgres via Prisma. Tables:
  - `Ad`: id, request, spec JSON, status, createdAt, parentId (refinements).
  - `Photo`: id, file, treatments[], tags[], focal, alt, approved.
  - `Settings`: director, matricula, defaultSede.
- **Photo library:** the clinic's own photos only (see `data/photos.example.json`). Upload screen with a focal-point picker: click on the image to set `focal`; show 1:1, 4:5 and 9:16 crop previews from it. Only `approved: true` photos are sent to Claude. **No AI image generation:** this is health advertising, and people who aren't patients shown as patients is misleading (brand rule).

## AdSpec → AdTemplate mapping
For each `format` in `spec.formats` and each `frame` in `spec.frames`:
```tsx
<AdTemplate
  format={format} layout={spec.layout}
  kicker={spec.slots.kicker} titular={frame.titular} cuerpo={frame.cuerpo}
  foto={photoUrl(spec.photo.id)} focal={spec.photo.focal ?? library[spec.photo.id].focal}
  sede={spec.slots.sede} cta={spec.slots.cta}
  director={settings.director} matricula={settings.matricula} condiciones={spec.legal.condiciones}
/>
```
Static formats use `frames[0]` only. Logo formats ignore every slot.

## Validation rules (`validateSpec`)
These are the checklist shown in the result screen, and they also gate the retries. Data lives in `data/brand.json`.
1. Char limits: Meta primaryText ≤ 125, headline ≤ 40, description ≤ 30. Google headline ≤ 30, longHeadline ≤ 90, description ≤ 90. Titular ≤ 60, cuerpo ≤ 90.
2. Each `titular` has at most one `*word*`.
3. No `!` or `¡` anywhere.
4. No `bannedPatterns` (result promises, luxury words, neutral imperatives, false urgency). Match case- and accent-insensitive.
5. Voseo: flag neutral imperatives using `voseoHints` (e.g. «coordina» → «coordiná»).
6. If any copy matches price or promo (`$`, `%`, `precio`, `promo`, `descuento`, `gratis`), `legal.condiciones` must be non-empty.
7. `photo.id` exists in the library and is approved.
8. Settings contain director + matrícula. This one blocks the download until it's filled in Settings.
9. The layout is valid for the format (all 4 layouts work on all non-logo formats).

Rules that need no runtime check, because the components enforce them: text contrast, white text never on `#8cc3c8`, logo minimum size and backgrounds, one dark block per piece, veil on photos, safe zones.

---

## Screens / Views
See `prototype/Ad Studio.html` (open it in a browser; it uses `mock-ai.js` instead of the real API).

### 1. Home (prompt)
- **Purpose:** enter the instruction.
- **Layout:** sticky header, then a centered column `max-width: 820px`, padding `96px 32px`, vertical gap 28px.
- **Header:** white `#ffffff`, bottom border 1px `#e6f1f1`, padding `16px 32px`, flex with gap 24.
  - Left: `<Logo size={36}/>` (lockup), then the kicker «Estudio de anuncios» (Jost 400, 13px, +0.24em, uppercase, `#3c757c`).
  - Right: links «Historial», «Fotos», «Ajustes» (Hanken 600, 14px, `#3c757c`, no underline; hover `#22343a`).
- **Kicker:** «Meta · Google Ads».
- **Headline:** «¿Qué anuncio necesitás *hoy*?», Jost 300, 56px, −0.02em, line-height 1.08, `#22343a`; «hoy» in Jost 300 italic `#4d9199`.
- **Intro:** Hanken 400, 17px / 1.7, `#51666b`. Copy: «Escribí el pedido. El estudio arma las piezas en todos los formatos, con el copy y los campos listos para cargar en Ads Manager.»
- **Prompt box:**
  - Container: white, 1px `#d4e8e9` border, radius 28, padding 20, flex column, gap 14.
  - Textarea: 3 rows, borderless, Hanken 18px / 1.6, placeholder «Ej.: Dame un reel sobre endodoncia para la sede de General Paz».
  - Footer row: hint «Formato, tratamiento, sede y objetivo. Lo que no digas, lo decide el estudio.» (13px, `#5d7075`), then the primary pill button «Crear anuncio» (web size: min-height 44, padding 15/26, Hanken 600 15px, bg `#8cc3c8`, text `#1b2c31`, hover `#6fb0b7`). The button sits at 60% opacity while the box is empty.
  - Submit: button click, or ⌘/Ctrl+Enter.
- **Suggestion chips:** flex wrap with gap 10. Each chip: white, 1px `#d4e8e9` border, pill, padding `10px 16px`, Hanken 500 14px `#22343a`. Clicking a chip fills the textarea; it doesn't submit. Chips: «Dame un reel sobre endodoncia» · «Feed 4:5 de limpieza dental para Nueva Córdoba» · «Campaña de ortodoncia para Google Display» · «Story de odontopediatría para General Paz».

### 2. Generating
- **Layout:** centered column `max-width: 620px`, padding `120px 32px`, gap 28.
- **Content:** kicker «Creando», then the request in quotes as H2 (Jost 300, 36px).
- **Steps card:** white, 1px `#e6f1f1` border, radius 22, padding `8px 24px`. Each row: padding 14px 0, top border `#e6f1f1`, a 10px dot, label in 15px. Steps:
  1. «Interpretando el pedido»
  2. «Escribiendo el copy»
  3. «Eligiendo foto y layout»
  4. «Validando reglas de marca»
  5. «Renderizando formatos»
- **Dot states:**
  - done: `#3c757c`
  - current: `#8cc3c8`, pulsing opacity 0.35↔1 over 1 s
  - pending: `#d4e8e9`, label `#5d7075`
- **Behavior:** drive the steps from real server events (SSE). On error, show a white card with the message and two buttons: «Reintentar» (primary) and «Volver» (secondary).

### 3. Result
- **Layout:** grid `minmax(0,1fr) 420px`, gap 32, padding 32, max-width 1440, centered. Below 1100px it stacks into one column.
- **Left column** (flex column, gap 20):
  - Kicker «{tratamiento} · {kind}». Then the request in quotes (Jost 300, 30px). Then `rationale` (14px, `#51666b`).
  - **Toolbar:**
    - Format pills: active = bg `#8cc3c8` / text `#1b2c31`; inactive = white with a `#d4e8e9` border. Label = «Feed vertical · 1080×1350».
    - Then a 1px divider, then the layout toggles `veil · split · flat · dark` (active bg `#bfdfe0`). Changing the layout re-renders instantly with no AI call.
    - On 9:16 formats only: a «Zonas seguras» checkbox that toggles `showGuides`.
  - **Preview:** native `<AdTemplate>` scaled to fit 620px tall (or 806px wide, whichever is smaller). Radius 10, border 1px `#e6f1f1`.
  - **Reels only:** a scene list to the right of the preview, 280px wide. Each scene: white card, radius 16, a 96px-tall thumbnail, «Escena n · Xs» and the titular. Selected scene border `#3c757c`. The header shows the total duration.
  - **Photo line:** «Foto: {id} · foco {focal}» (13px). In the real app, this opens a photo picker filtered by treatment.
  - **Refine bar:** pill-shaped white input (1px `#d4e8e9`, padding `6px 6px 6px 22px`) plus the primary button «Aplicar». Placeholder: «Pedí un cambio: «titular más corto», «usá la sede de Nueva Córdoba»…». Submit runs `/api/generate` with `<current_spec>` and creates a child `Ad` (parentId).
- **Right column** (gap 20):
  - **Platform card:** white, border `#e6f1f1`, radius 22, padding `18px 22px 8px`.
    - Tabs «Meta Ads Manager» / «Google Ads»: active = bg `#22343a`, white text, pill.
    - Fields are rows with a top border. Each row has the label (Hanken 600, 12px, `#5d7075`), a counter `n/max` (`#3c757c`, or `#22343a` plus a failed check when over the limit), a «Copiar» pill (white, `#d4e8e9` border, 12px 600) that shows «Copiado» for 1.2 s, and the value (15px / 1.55, `#22343a`).
    - Meta fields: Texto principal (125), Título (40), Descripción (30), Botón (label + enum), Destino WhatsApp (monospace), and for reels: Caption (2200), Audio sugerido.
    - Google fields: Título 1–5 (30), Título largo (90), Descripción 1–n (90), Nombre de la empresa «Smile Lab».
    - Every field should be editable inline in the real app. Edits re-run `validateSpec` and are saved.
  - **Checklist card:** kicker «Checklist» plus `ok/total`. Rows: a 20px circle (pass = filled `#3c757c` with a white ✓; fail = 1.5px `#22343a` ring), label 14px, optional note 12px `#5d7075`. Rules are the validation list above.
  - **Download:** full-width solid dark pill «Descargar paquete (.zip)» (bg `#22343a`, white, hover `#0f1d21`). It's disabled while blocking checks fail (#7, #8 and any char limit). Note below, 12px `#5d7075`: «MP4 1080×1920 + PNG por escena + copy.txt + ad.json» or «N PNG a tamaño real + copy.txt + ad.json».

### 4. Historial / Fotos / Ajustes (not mocked)
Build them with the same vocabulary: white cards on `#f6fafa`, 1px `#e6f1f1` borders, radius 22, Jost Light titles, Hanken body.
- **Historial:** a grid of thumbnails (the first format of each ad) showing the request and date, with refinements nested under the parent.
- **Fotos:** upload, focal-point picker, crop previews, tags and treatments, an approved toggle.
- **Ajustes:** director odontológico, matrícula, default sede, and a model selector.

## Interactions & behavior
- Transitions: 200 ms ease on background color (buttons, pills). No other animation in the app except the generating pulse.
- Keyboard: ⌘/Ctrl+Enter submits on Home; Enter submits on the refine bar.
- Layout/format switches are client-only. Text edits are client-only plus validation. Only Home and Refine call the AI.
- Errors from Anthropic (rate limit, overload) show a retry card. Never expose the raw API error or the key.
- Responsive: the app targets desktop (≥ 1100px). On narrow screens the Result view stacks; mobile is a nice-to-have.

## State
- `view: 'home' | 'generating' | 'result'`, `prompt`, `step` (from SSE), `spec: AdSpec`, `activeFormat`, `activeFrame`, `platformTab`, `showGuides`.
- Server: `Ad` rows (spec versions), `Photo` library, `Settings`.

## Design tokens
All tokens are in `tokens/*.css` (imported by `styles.css`); full rules are in `BRAND.md`. Key values:
- **Base:** bg `#f6fafa` · surface `#ffffff` · line `#e6f1f1` · line-strong `#d4e8e9` · photo `#cfe6e6`
- **Ink:** ink `#22343a` · body `#51666b` · muted2 `#5d7075`
- **Accent:** accent `#8cc3c8` · hover `#6fb0b7` · soft `#bfdfe0` · deep `#a9d3d5` · accent-ink `#3c757c` · italic `#4d9199` · on-accent `#1b2c31`
- **Dark:** dark `#22343a` · dark-deep `#0f1d21` · dark-body `#b9cbce` · dark-line3 `#46595f`
- **Brand (logo only):** `#327180`, `#afd1d3`
- **Type:** Jost 300/400/500/600 + italics (display), Hanken Grotesk 400/500/600 (text), both from Google Fonts. H1 Light −0.02em lh 1.05–1.1; H2 Light −0.005em lh 1.15; H3 400 lh 1.25; kicker 400 uppercase +0.24em; body 400 lh 1.7; button 600 lh 1.
- **Radii (web):** pill 999 · panel 28 · card 22 (18 mobile) · tile 18 · frame 16. In ads (on a 1080 canvas) the radii are ×1.75.
- **Shadow:** only the card hover `0 16px 34px -22px rgba(34,52,58,0.4)`. No others.
- **Veil:** `linear-gradient(180deg, rgba(34,52,58,.35), rgba(34,52,58,.55))`, the only gradient allowed.
- **Ad spacing (1080 canvas):** 8 / 16 / 24 / 32 / 44 / 56 / 72 / 96, outer margin 72. Scale factor `s = min(w, 1.25·h) / 1080`.

## Assets
- `assets/logo-symbol.svg`: logo symbol, built from the exact paths of the production site (viewBox 0 0 100 98.48). Never stretch it or add effects.
- **Photos:** not included. The clinic must upload its own photos (treatments, reception, team). All renders currently show a `#cfe6e6` placeholder.
- **Icons:** none; the system is text-only. The WhatsApp glyph, if ever needed, must come from Meta's official brand resources.

## Files
- `README.md`: this document
- `BRAND.md`: full brand and design-system guide (voice, visual foundations, extensions)
- `styles.css`, `tokens/`: CSS custom properties and fonts
- `components/`: **files are `.jsx.txt`** (renamed so this design-system project doesn't register them twice; rename them back to `.jsx`/`.tsx` when porting). Logo, Button, Kicker, Headline, Photo, TreatmentCard, SedeBlock, LegalStrip, SafeZones, AdTemplate (`.jsx` + `.types.ts` props + `.prompt.md` usage notes)
- `schema/ad-spec.schema.json`: the AI output contract (tool `input_schema`)
- `prompts/system-prompt.md`: the system prompt
- `data/brand.json`: sedes, CTAs, limits, banned patterns, voseo hints
- `data/photos.example.json`: photo-library shape
- `prototype/Ad Studio.html` (+ `studio.jsx`, `mock-ai.js`): clickable app prototype with mocked AI
- `reference/ads_kit/`: template gallery, 3 example ads, do/don't, pre-publication checklist
- `assets/ds-fallback.js`: prototype-only loader that builds the components from source in the browser. Not for production.

## Open items for the client
- Clinic photos plus a focal point for each.
- The exact legal text (director odontológico, matrícula) approved by the Colegio Odontológico de Córdoba.
- Whether reels should eventually carry richer motion or voice-over. v1 is crossfade + Ken Burns only.
- Verify the Meta CTA enum values and Google asset limits against the current platform docs before launch.
