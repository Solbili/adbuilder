const DS = window.SmileLabAdsDesignSystem_b3a8a8;
const { Logo, Button, Kicker, Headline, AdTemplate, AD_FORMATS } = DS;

const SUGGESTIONS = ["Dame un reel sobre endodoncia", "Feed 4:5 de limpieza dental para Nueva Córdoba", "Campaña de ortodoncia para Google Display", "Story de odontopediatría para General Paz"];
const LIMITS = { primaryText: 125, headline: 40, description: 30, caption: 2200, gHeadline: 30, longHeadline: 90, gDescription: 90 };
const STEPS = ["Interpretando el pedido", "Escribiendo el copy", "Eligiendo foto y layout", "Validando reglas de marca", "Renderizando formatos"];
const CTA_LABEL = { WHATSAPP_MESSAGE: "Enviar mensaje de WhatsApp", LEARN_MORE: "Más información", BOOK_NOW: "Reservar" };

function validate(spec) {
  const all = [spec.meta.primaryText, spec.meta.headline, ...spec.frames.map(f => f.titular + " " + (f.cuerpo || ""))].join(" ");
  const italics = spec.frames.map(f => (f.titular.match(/\*[^*]+\*/g) || []).length);
  return [
    ["Texto principal ≤ 125 caracteres", spec.meta.primaryText.length <= 125],
    ["Título ≤ 40 caracteres", spec.meta.headline.length <= 40],
    ["Una sola palabra en itálica por pieza", italics.every(n => n <= 1)],
    ["Sin signos de exclamación", !/[!¡]/.test(all)],
    ["Sin promesa de resultado", !/perfect|garantiz|sin dolor|transform/i.test(all)],
    ["Voseo (sin «reserva tu cita», «agenda»)", !/reserva tu|agenda tu|coordina tu|elige /i.test(all)],
    ["Precio → condiciones en legales", !/\$|%|precio|promo/i.test(all) || !!spec.legal.condiciones],
    ["Foto propia de la clínica", !!spec.photo.id],
    ["Legales: director y matrícula", false, "Falta cargar en Ajustes"],
  ];
}

function Scaled({ format, max, children }) {
  const f = AD_FORMATS[format];
  const k = Math.min(max / f.h, (max * 1.3) / f.w);
  return (
    <div style={{ width: f.w * k, height: f.h * k, overflow: "hidden", borderRadius: 10, border: "1px solid var(--line)", flex: "none", background: "var(--bg)" }}>
      <div style={{ transform: `scale(${k})`, transformOrigin: "0 0", width: f.w, height: f.h }}>{children}</div>
    </div>
  );
}

function Header({ onHome }) {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: 24, padding: "16px 32px", background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
      <button onClick={onHome} style={{ border: 0, background: "none", padding: 0, cursor: "pointer" }}><Logo size={36} /></button>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--accent-ink)" }}>Estudio de anuncios</span>
      <nav style={{ marginLeft: "auto", display: "flex", gap: 20, fontSize: 14, fontWeight: 600 }}><a href="#" style={{ textDecoration: "none" }}>Historial</a><a href="#" style={{ textDecoration: "none" }}>Fotos</a><a href="#" style={{ textDecoration: "none" }}>Ajustes</a></nav>
    </header>
  );
}

function PromptBox({ value, onChange, onSubmit, compact }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: compact ? 999 : 28, padding: compact ? "6px 6px 6px 22px" : 20, display: "flex", flexDirection: compact ? "row" : "column", gap: 14, alignItems: compact ? "center" : "stretch" }}>
      {compact
        ? <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === "Enter" && value.trim() && onSubmit()} placeholder="Pedí un cambio: «titular más corto», «usá la sede de Nueva Córdoba»…" style={{ flex: 1, border: 0, background: "none", font: "400 15px var(--font-text)", color: "var(--ink)", minWidth: 0 }} />
        : <textarea value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.metaKey || e.ctrlKey) && value.trim() && onSubmit()} rows={3} placeholder="Ej.: Dame un reel sobre endodoncia para la sede de General Paz" style={{ border: 0, resize: "none", background: "none", font: "400 18px/1.6 var(--font-text)", color: "var(--ink)" }} />}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14 }}>
        {!compact && <span style={{ fontSize: 13, color: "var(--muted2)", marginRight: "auto" }}>Formato, tratamiento, sede y objetivo. Lo que no digas, lo decide el estudio.</span>}
        <Button size="web" onClick={() => value.trim() && onSubmit()} style={{ opacity: value.trim() ? 1 : 0.6 }}>{compact ? "Aplicar" : "Crear anuncio"}</Button>
      </div>
    </div>
  );
}

function Home({ onSubmit }) {
  const [v, setV] = React.useState("");
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "96px 32px", display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Kicker size={13}>Meta · Google Ads</Kicker>
        <Headline size={56} text="¿Qué anuncio necesitás *hoy*?" />
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--body)" }}>Escribí el pedido. El estudio arma las piezas en todos los formatos, con el copy y los campos listos para cargar en Ads Manager.</p>
      </div>
      <PromptBox value={v} onChange={setV} onSubmit={() => onSubmit(v)} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {SUGGESTIONS.map(s => <button key={s} onClick={() => setV(s)} style={{ border: "1px solid var(--line-strong)", background: "var(--surface)", borderRadius: 999, padding: "10px 16px", font: "500 14px var(--font-text)", color: "var(--ink)", cursor: "pointer" }}>{s}</button>)}
      </div>
    </main>
  );
}

function Generating({ prompt, step }) {
  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "120px 32px", display: "flex", flexDirection: "column", gap: 28 }}>
      <Kicker size={13}>Creando</Kicker>
      <Headline level={2} size={36} text={`«${prompt}»`} />
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "8px 24px" }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : 0, fontSize: 15, color: i <= step ? "var(--ink)" : "var(--muted2)" }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: i < step ? "var(--accent-ink)" : i === step ? "var(--accent)" : "var(--line-strong)", animation: i === step ? "slpulse 1s infinite" : "none" }}></span>{s}
          </div>))}
      </div>
    </main>
  );
}

function Field({ label, value, max, mono }) {
  const [copied, setCopied] = React.useState(false);
  const over = max && value.length > max;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "14px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--muted2)" }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        {max && <span style={{ color: over ? "var(--ink)" : "var(--accent-ink)", fontWeight: 600 }}>{value.length}/{max}</span>}
        <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }} style={{ marginLeft: "auto", border: "1px solid var(--line-strong)", background: "var(--surface)", borderRadius: 999, padding: "5px 12px", font: "600 12px var(--font-text)", color: "var(--ink)", cursor: "pointer" }}>{copied ? "Copiado" : "Copiar"}</button>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink)", fontFamily: mono ? "ui-monospace, monospace" : "inherit" }}>{value}</div>
    </div>
  );
}

function Result({ spec, setSpec, onRefine }) {
  const [fmt, setFmt] = React.useState(spec.formats[0]);
  const [frame, setFrame] = React.useState(0);
  const [tab, setTab] = React.useState(spec.platform === "google" ? "google" : "meta");
  const [refine, setRefine] = React.useState("");
  const [guides, setGuides] = React.useState(false);
  React.useEffect(() => { setFmt(spec.formats[0]); setFrame(0); }, [spec.id]);
  const f = spec.frames[frame] || spec.frames[0];
  const checks = validate(spec);
  const okCount = checks.filter(c => c[1]).length;
  const slots = { ...spec.slots, titular: f.titular, cuerpo: f.cuerpo, focal: spec.photo.focal, condiciones: spec.legal.condiciones };
  return (
    <main style={{ padding: 32, display: "grid", gridTemplateColumns: "minmax(0,1fr) 420px", gap: 32, alignItems: "start", maxWidth: 1440, margin: "0 auto" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Kicker size={12}>{spec.treatment} · {spec.kind}</Kicker>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 30, letterSpacing: "-.01em" }}>«{spec.request}»</div>
          <div style={{ fontSize: 14, color: "var(--body)" }}>{spec.rationale}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {spec.formats.map(k => <button key={k} onClick={() => setFmt(k)} style={{ border: "1px solid " + (fmt === k ? "transparent" : "var(--line-strong)"), background: fmt === k ? "var(--accent)" : "var(--surface)", color: fmt === k ? "var(--on-accent)" : "var(--ink)", borderRadius: 999, padding: "8px 14px", font: "600 13px var(--font-text)", cursor: "pointer" }}>{AD_FORMATS[k].label.split("· ")[1]} · {AD_FORMATS[k].w}×{AD_FORMATS[k].h}</button>)}
          <span style={{ width: 1, height: 24, background: "var(--line-strong)", margin: "0 4px" }}></span>
          {["veil", "split", "flat", "dark"].map(l => <button key={l} onClick={() => setSpec({ ...spec, layout: l })} style={{ border: 0, background: spec.layout === l ? "var(--accent-soft)" : "transparent", color: "var(--ink)", borderRadius: 999, padding: "8px 12px", font: "600 13px var(--font-text)", cursor: "pointer" }}>{l}</button>)}
          {AD_FORMATS[fmt].safeTop && <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "var(--body)", marginLeft: 8 }}><input type="checkbox" checked={guides} onChange={e => setGuides(e.target.checked)} />Zonas seguras</label>}
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Scaled format={fmt} max={620}><AdTemplate format={fmt} layout={spec.layout} {...slots} showGuides={guides} /></Scaled>
          {spec.frames.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)" }}>Escenas del reel · {spec.frames.reduce((a, x) => a + x.durationSec, 0)} s</span>
              {spec.frames.map((x, i) => (
                <button key={i} onClick={() => setFrame(i)} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid " + (i === frame ? "var(--accent-ink)" : "var(--line)"), background: "var(--surface)", borderRadius: 16, padding: 8, cursor: "pointer", textAlign: "left", width: 280 }}>
                  <Scaled format={fmt} max={96}><AdTemplate format={fmt} layout={spec.layout} {...spec.slots} titular={x.titular} cuerpo={x.cuerpo} focal={spec.photo.focal} /></Scaled>
                  <span style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--ink)" }}><b style={{ fontWeight: 600 }}>Escena {i + 1} · {x.durationSec} s</b><span style={{ color: "var(--body)" }}>{x.titular.replace(/\*/g, "")}</span></span>
                </button>))}
            </div>)}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted2)" }}>Foto: <b style={{ fontWeight: 600, color: "var(--ink)" }}>{spec.photo.id}</b> · foco {spec.photo.focal} — placeholder en este prototipo</div>
        <PromptBox compact value={refine} onChange={setRefine} onSubmit={() => { onRefine(refine); setRefine(""); }} />
      </section>
      <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "18px 22px 8px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            {[["meta", "Meta Ads Manager"], ["google", "Google Ads"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ border: 0, borderRadius: 999, padding: "8px 14px", font: "600 13px var(--font-text)", cursor: "pointer", background: tab === k ? "var(--dark)" : "transparent", color: tab === k ? "#fff" : "var(--ink)" }}>{l}</button>)}
          </div>
          {tab === "meta" ? <>
            <Field label="Texto principal" value={spec.meta.primaryText} max={LIMITS.primaryText} />
            <Field label="Título" value={spec.meta.headline} max={LIMITS.headline} />
            <Field label="Descripción" value={spec.meta.description} max={LIMITS.description} />
            <Field label="Botón (call to action)" value={`${CTA_LABEL[spec.meta.callToAction]} · ${spec.meta.callToAction}`} />
            <Field label="Destino WhatsApp" value={spec.meta.destination} mono />
            {spec.reel && <Field label="Caption del reel" value={spec.reel.caption} max={LIMITS.caption} />}
            {spec.reel && <Field label="Audio sugerido" value={spec.reel.audio} />}
          </> : <>
            {spec.google.headlines.map((h, i) => <Field key={i} label={`Título ${i + 1}`} value={h} max={LIMITS.gHeadline} />)}
            <Field label="Título largo" value={spec.google.longHeadline} max={LIMITS.longHeadline} />
            {spec.google.descriptions.map((h, i) => <Field key={i} label={`Descripción ${i + 1}`} value={h} max={LIMITS.gDescription} />)}
            <Field label="Nombre de la empresa" value="Smile Lab" />
          </>}
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><Kicker size={12}>Checklist</Kicker><span style={{ fontSize: 13, fontWeight: 600 }}>{okCount}/{checks.length}</span></div>
          {checks.map(([t, ok, note]) => (
            <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: "1px solid var(--line)", fontSize: 14, lineHeight: 1.45 }}>
              <span style={{ flex: "none", width: 20, height: 20, borderRadius: 999, background: ok ? "var(--accent-ink)" : "var(--surface)", border: ok ? 0 : "1.5px solid var(--ink)", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{ok ? "✓" : ""}</span>
              <span style={{ color: "var(--ink)" }}>{t}{note && <span style={{ display: "block", fontSize: 12, color: "var(--muted2)" }}>{note}</span>}</span>
            </div>))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Button size="web" variant="dark" style={{ width: "100%" }}>Descargar paquete (.zip)</Button>
          <span style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.5 }}>{spec.kind === "reel" ? "MP4 1080×1920 + PNG por escena + copy.txt + ad.json" : `${spec.formats.length} PNG a tamaño real + copy.txt + ad.json`}</span>
        </div>
      </aside>
    </main>
  );
}

function App() {
  const [view, setView] = React.useState("home");
  const [prompt, setPrompt] = React.useState("");
  const [step, setStep] = React.useState(0);
  const [spec, setSpec] = React.useState(null);
  const run = (p, base) => {
    setPrompt(p); setView("generating"); setStep(0);
    let i = 0;
    const t = setInterval(() => {
      i++; setStep(i);
      if (i >= STEPS.length) {
        clearInterval(t);
        const next = base ? { ...base, id: base.id + "r", request: base.request + " → " + p } : window.mockGenerate(p);
        if (base && /corto/i.test(p)) next.frames = next.frames.map(f => ({ ...f, cuerpo: "" }));
        if (base && /nueva c/i.test(p)) next.slots = { ...next.slots, sede: "nueva-cordoba" };
        setSpec(next); setView("result");
      }
    }, base ? 250 : 420);
  };
  return (
    <div style={{ minHeight: "100vh" }}>
      <Header onHome={() => setView("home")} />
      {view === "home" && <Home onSubmit={p => run(p)} />}
      {view === "generating" && <Generating prompt={prompt} step={step} />}
      {view === "result" && spec && <Result spec={spec} setSpec={setSpec} onRefine={p => run(p, spec)} />}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
