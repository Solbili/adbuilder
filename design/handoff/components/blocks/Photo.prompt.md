Photo slot with a focal point and the #22343a veil — the only gradient allowed in the system.

```jsx
<Photo src="fotos/recepcion.jpg" focal="40% 35%" style={{ width: 540, height: 540 }} />
<Photo src={foto} focal={focal} veil style={{ position: "absolute", inset: 0 }} />
```

Only real clinic photos (treatments, reception, team). Never stock "happy patients". Text over photo always needs `veil` (0.35–0.55) or a solid card.
