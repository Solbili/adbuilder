const DS = window.SmileLabAdsDesignSystem_b3a8a8;

const PRESETS = {
  limpieza: {
    name: "Limpieza dental", campana: "Volumen", layout: "veil",
    slots: { kicker: "Limpieza dental", titular: "Limpieza dental con turno por *WhatsApp*.", cuerpo: "Elegí la sede: General Paz o Nueva Córdoba. Te respondemos por WhatsApp.", cta: "Sacar turno", sede: "ambas", focal: "50% 40%" },
    meta: { texto: "Limpieza dental en Córdoba. Sacá turno por WhatsApp en General Paz o Nueva Córdoba. Lun a Vie 9–19 y Sáb 9–13.", titulo: "Limpieza dental · Turno por WhatsApp" },
    google: { titulo: "Limpieza dental en Córdoba", largo: "Limpieza dental en General Paz y Nueva Córdoba. Sacá turno por WhatsApp.", descripcion: "Atendemos adultos y chicos. Lunes a viernes de 9 a 19 y sábados de 9 a 13." },
    formats: ["meta-feed-4x5", "meta-feed-1x1", "meta-stories"],
  },
  ortodoncia: {
    name: "Ortodoncia", campana: "Consideración", layout: "flat",
    slots: { kicker: "Ortodoncia", titular: "Ortodoncia, explicada *paso a paso*.", cuerpo: "En la primera consulta evaluamos tu caso y te contamos opciones, tiempos y costos.", cta: "Consultar por WhatsApp", sede: "ambas", focal: "55% 45%" },
    meta: { texto: "¿Pensás en ortodoncia? En la primera consulta evaluamos tu caso y te explicamos opciones, tiempos y costos.", titulo: "Ortodoncia en Córdoba, paso a paso" },
    google: { titulo: "Ortodoncia en Córdoba", largo: "Primera consulta de ortodoncia: evaluamos tu caso y te explicamos opciones y tiempos.", descripcion: "Ortodoncia en General Paz y Nueva Córdoba. Consultá por WhatsApp." },
    formats: ["meta-feed-1x1", "google-display-191x1", "google-display-4x5"],
  },
  pediatria: {
    name: "Odontopediatría", campana: "Segmento", layout: "dark",
    slots: { kicker: "Odontopediatría", titular: "Odontología para *chicos*, con tiempo.", cuerpo: "Atendemos a los más chicos en General Paz y Nueva Córdoba. Coordiná el turno por WhatsApp.", cta: "Sacar turno", sede: "ambas", focal: "50% 45%" },
    meta: { texto: "Turnos de odontopediatría en General Paz y Nueva Córdoba. Coordiná por WhatsApp y elegí el horario que te quede bien.", titulo: "Odontopediatría en dos sedes" },
    google: { titulo: "Odontopediatría en Córdoba", largo: "Atención odontológica para chicos en General Paz y Nueva Córdoba. Coordiná por WhatsApp.", descripcion: "Turnos de lunes a sábado. Consultá por WhatsApp y elegí la sede que te quede cerca." },
    formats: ["meta-stories", "meta-feed-4x5", "google-demandgen-9x16"],
  },
  vacio: {
    name: "Slots vacíos", campana: "Plantilla", layout: "veil",
    slots: { kicker: "{tratamiento}", titular: "{titular} con una *palabra* en itálica.", cuerpo: "{cuerpo} — línea de apoyo opcional, hasta 90 caracteres.", cta: "{cta}", sede: "ambas", focal: "50% 50%" },
  },
};

function Scaled({ format, k, children }) {
  const f = DS.AD_FORMATS[format];
  return (
    <div style={{ width: f.w * k, height: f.h * k, overflow: "hidden", borderRadius: 6, border: "1px solid var(--line)", background: "var(--bg)", flex: "none" }}>
      <div style={{ transform: `scale(${k})`, transformOrigin: "0 0", width: f.w, height: f.h }}>{children}</div>
    </div>
  );
}

function KitNav({ current }) {
  const items = [["index.html", "Plantillas"], ["examples.html", "Ejemplos"], ["do-dont.html", "Do / Don't"], ["checklist.html", "Checklist"]];
  return (
    <header style={{ display: "flex", alignItems: "center", gap: 32, padding: "18px 32px", background: "var(--surface)", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
      <DS.Logo size={38} />
      <nav style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
        {items.map(([href, label]) => (
          <a key={href} href={href} style={{ padding: "10px 16px", borderRadius: 999, fontWeight: 600, fontSize: 14, textDecoration: "none", color: current === href ? "var(--on-accent)" : "var(--ink)", background: current === href ? "var(--accent)" : "transparent" }}>{label}</a>
        ))}
      </nav>
    </header>
  );
}

function Seg({ value, options, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: 999, padding: 3, gap: 2, flexWrap: "wrap" }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{ border: 0, cursor: "pointer", borderRadius: 999, padding: "8px 14px", font: "600 13px var(--font-text)", background: value === v ? "var(--accent)" : "transparent", color: value === v ? "var(--on-accent)" : "var(--ink)" }}>{l}</button>
      ))}
    </div>
  );
}

Object.assign(window, { DS, PRESETS, Scaled, KitNav, Seg });
