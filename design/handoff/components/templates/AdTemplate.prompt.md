The parametrized Smile Lab ad — pick a format and one of four layouts, then fill the named slots; never redesign per piece.

```jsx
<AdTemplate
  format="meta-feed-4x5" layout="veil"
  kicker="Limpieza dental"
  titular="Limpieza dental con turno por *WhatsApp*."
  cuerpo="Elegí la sede: General Paz o Nueva Córdoba."
  foto="fotos/limpieza.jpg" focal="45% 40%"
  sede="ambas" cta="Sacar turno"
  director="Dra. Nombre Apellido" matricula="0000"
/>
```

- Formats: meta-feed-1x1, meta-feed-4x5, meta-stories, meta-reels, google-display-191x1, google-display-1x1, google-display-4x5, google-demandgen-9x16, google-logo-1x1, google-logo-4x1. `AD_FORMATS` exports sizes.
- Renders at real pixel size (e.g. 1080×1350). Scale the wrapper with CSS transform for previews.
- 9:16 formats keep 250px top / 250px (Stories) or 420px (Reels) bottom free; `showGuides` draws them.
- Same `foto` + `focal` across 1:1, 4:5 and 9:16 = the three Performance Max crops.
