# Smile Lab — Ads Design System

Design system for **Meta (Facebook/Instagram) and Google Ads** of Smile Lab Odontología, a dental clinic for adults and children in Córdoba, Argentina (since 2019). Everything is parametrized: change photo, headline and offer without redesigning.

## Sources
- Brand brief pasted by the client (values measured from the production website's code). No repository, Figma or site URL was attached; nobody here has seen the live site.
- Logo: **vector paths supplied in the brief** (viewBox `0 0 100 98.48`) → `assets/logo-symbol.svg`. The original raster logo (`Gemini_Generated_Image_davj4gdavj4gdavj.jpg`) and the 6–10 clinic photos mentioned in the brief **were not attached** — every photo is a `#cfe6e6` placeholder with a focal-point marker.

## Brand facts
- **Smile Lab** · razón social Smile Lab Odontología · Instagram @smilelabargentina
- Tagline: «Odontología clara y cercana en Córdoba.»
- **General Paz** — Gral. Román Deheza 158 · WhatsApp +54 351 688-6431
- **Nueva Córdoba** — Av. Ambrosio Olmos 782 · WhatsApp +54 9 351 258-4060
- Lun a Vie 9–19 · Sáb 9–13 · Dom cerrado
- Treatments: limpieza dental, endodoncia, caries y restauraciones, ortodoncia, blanqueamiento, odontopediatría
- Conversion: WhatsApp (primary), online booking (secondary)
- Positioning: clarity and closeness. Not luxury, not cold clinic. No gold, black marble or "premium experience".

## CONTENT FUNDAMENTALS
- **Rioplatense Spanish with voseo**: «Coordiná tu turno», «Elegí la sede», «Sacá turno», «Consultá por WhatsApp». Never neutral «coordina», «reserva tu cita», «agenda tu consulta».
- Addresses the reader as **vos**; the clinic speaks as **nosotros** («Te respondemos por WhatsApp», «evaluamos tu caso»).
- Short sentences. **No exclamation marks. No emoji.** Sentence case; uppercase only in kickers and the wordmark.
- Concrete over aspirational: WhatsApp booking, two locations, care for kids, the specific treatment. Not "sonrisas que transforman vidas".
- **Health advertising: no promised results** («sonrisa perfecta», «sin dolor garantizado»). No "20% OFF", no false urgency. Any price or promo needs validity + conditions in the legal strip; promos are defined by the client.
- CTAs: «Sacar turno» · «Consultar por WhatsApp» · «Ver tratamientos».
- Lengths: Meta primary text ~125 chars, Meta headline 27–40. Google headline 30, long headline 90, description 90.
- Examples: «Limpieza dental con turno por *WhatsApp*.» · «Ortodoncia, explicada *paso a paso*.» · «Odontología para *chicos*, con tiempo.»
- Note: the site's own hero «Viví la magia de una sonrisa perfecta.» reads as a result promise under the ad rules — fine as a type specimen, don't reuse it as ad copy.

## VISUAL FOUNDATIONS
- **Color**: light, cool teal-on-off-white. Canvas `#f6fafa` (never pure white; white is for cards and logo bars). Ink `#22343a`, body `#51666b`, meta `#5d7075`. The accent family (`#8cc3c8` etc.) carries visual weight; `#3c757c` is the readable teal for text. `#22343a` dark band is a structural accent — **max one dark block per piece**. `brand #327180` / `brand-light #afd1d3` are logo-only.
- **Contrast**: all text ≥ 4.5:1. Text on `#8cc3c8` is always `#1b2c31` (7.4:1); white on it is 1.9:1. Light text on teal needs `#3c757c` or darker.
- **Type**: Jost (display) + Hanken Grotesk (text). The signature is **Jost Light headlines with negative tracking** (H1 −0.02em, 1.05–1.1). Never bolded — size up instead (ad H1 ≥ 72px on 1080, default 84). Kicker Jost 400 uppercase +0.24em. Body Hanken 400 / 1.7 (1.45 in ads). Buttons Hanken 600.
- **Italic word**: exactly one word per piece in Jost Light italic, `#4d9199` on light.
- **Backgrounds**: flat color only — `#f6fafa`, `#ffffff` cards, `#8cc3c8` blocks, `#22343a` band — plus real photography. No textures, patterns or illustrations. **No gradients** except the photo veil.
- **Photography**: own clinic photos only (treatments with brackets/rubber dam/restorations, reception, team). Warm, natural light, lots of white and teal. No stock "happy patients", no aggressive clinical close-ups, no blood. Physical signage in the photos is still violet `#7d8ac8` — leave it as is.
- **Protection**: text over photo always on a `#22343a` veil at 35–55% (`--veil`, top→bottom) or a solid card. Logo never loose on a photo.
- **Corners**: pill buttons (999px); panels 28px, cards 22px (18px mobile), tiles 18px, frames 16px on web. On a 1080 ad canvas × 1.75 → 49 / 38 / 32 / 28px.
- **Cards**: white, 1px `#e6f1f1` border, on `#f6fafa`. No shadow at rest.
- **Shadows**: the only one is the web card hover `0 16px 34px -22px rgba(34,52,58,.4)`. Ads use none. No hard shadows, no glows, no blur/transparency effects besides the veil.
- **Borders**: 1px. Secondary button border `#d4e8e9`; on dark `#46595f`.
- **Hover / press (web)**: primary `#8cc3c8 → #6fb0b7`; dark / on-dark → `#0f1d21`; card gains the hover shadow. No press-shrink documented. Ads are static — no animation.
- **Layout (ads)**: 72px outer margin on 1080; copy stack gap 28, copy→CTA 44. Every template ends in a footer bar (logo lockup + legal strip) in `#f6fafa`, or `#22343a` on the dark layout. 9:16 safe zones: 250px top; 250px (Stories) / 420px (Reels) bottom, filled by background, never content.
- **Scale rule**: components take `s` = min(w, 1.25·h) / 1080, so a 1200×628 banner uses s≈0.73 and a 1200×1200 uses 1.11.

## ICONOGRAPHY
- The brief defines **no icon set**, and none is used in the system. CTAs are text-only pills; contact info is written out («WhatsApp +54 351 688-6431»).
- No emoji, no unicode pictograms in ads (the ✓/✕ marks only appear in internal guideline pages).
- If icons become necessary, propose a thin-stroke outline set (e.g. Lucide at 1.5px) as a declared extension. The WhatsApp glyph must come from Meta's official brand resources — it is not drawn here.
- The only brand graphic is the logo: `assets/logo-symbol.svg` (clean symbol, no inner "SMILE LAB").

## Declared extensions (not in the site)
- **Ad spacing scale** `--space-1…8` (8–96px) and 72px margin — the site gives no scale.
- **Ad-size radii and type** (×1.75 radii; ad H1 84 / flat 100, body 30, legal 18).
- **Italic word on dark** uses `#8cc3c8` (6.6:1) and on the accent block `#1b2c31`, because `#4d9199` fails there (2.8:1 / 1.9:1). On veiled photo: `#bfdfe0`.
- **`#4d9199` on `#f6fafa` is 3.4:1** — passes only as large text. Kept at headline size (≥72px on 1080) as the site does; flag if you want the strict 4.5:1 everywhere.
- `accent-ink` on `accent-soft` is 3.7:1 → chips use `#22343a` text.
- Demand Gen 9:16 has no safe zone spec in the brief; templates apply none (guides off). Recommend keeping 250/250 free.
- No new colors or fonts were added.

## Index
- `styles.css` → `tokens/` (`fonts.css`, `colors.css`, `typography.css`, `shape.css`, `spacing.css`)
- `assets/logo-symbol.svg`
- `assets/ds-fallback.js` — dev shim: if `_ds_bundle.js` is missing, builds the component namespace from the `.jsx` sources so kit pages and cards still render
- `guidelines/` — foundation cards (colors, contrast pairs, type, radii, elevation, spacing, safe zones, logo rules, photo & veil)
- `components/` — see list below; one card per folder
- `ui_kits/ads/` — `index.html` (templates per format, interactive), `examples.html` (3 campaigns with platform copy + char counts), `do-dont.html`, `checklist.html` (pre-publication, persists)
- `templates/anuncio/Anuncio.dc.html` — editable ad template with props for format, layout and every slot
- `SKILL.md`, `thumbnail.html`

## Components
- **Logo** (`components/brand`) — lockup / stacked / symbol, light & dark
- **Button** (`components/core`) — primary, secondary, onDark, dark; `size="ad" | "web"`
- **Kicker** (`components/core`) — uppercase overline
- **Headline** (`components/core`) — Jost Light; `*word*` = italic teal (one only)
- **Photo** (`components/blocks`) — focal point + veil, placeholder
- **TreatmentCard** (`components/blocks`)
- **SedeBlock** (`components/blocks`) — real data for both clinics; also exports `SEDES`
- **LegalStrip** (`components/blocks`) — director odontológico + matrícula + promo conditions
- **SafeZones** (`components/blocks`) — 9:16 guides
- **AdTemplate** (`components/templates`) — all 10 formats × `veil | split | flat | dark`; exports `AD_FORMATS`

Intentional additions: **Photo** (focal-point crops required by the brief), **SafeZones** (visible guides requested), **AdTemplate** (the parametrized layouts).

## Slots
`{titular}` → `titular` · `{tratamiento}` → `kicker` · `{foto}` → `foto` + `focal` · `{sede}` → `sede` · `{cta}` → `cta` · legales → `director`, `matricula`, `condiciones`.
Legal text must be confirmed with the Colegio Odontológico de Córdoba before publishing.
