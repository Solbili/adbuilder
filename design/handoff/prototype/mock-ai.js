// MOCK of POST /api/generate. The real app calls Claude with prompts/system-prompt.md and
// schema/ad-spec.schema.json; this returns canned AdSpec objects so the prototype is clickable.
const TREATMENTS = {
  endodoncia: { name: "Endodoncia", photo: "endo-aislacion-01", focal: "52% 44%",
    frames: [
      { titular: "Endodoncia sin *vueltas*.", cuerpo: "Te explicamos el tratamiento antes de empezar." },
      { titular: "Primero evaluamos, después te *explicamos*.", cuerpo: "Tratamiento de conducto con anestesia local." },
      { titular: "Turno por *WhatsApp*.", cuerpo: "General Paz o Nueva Córdoba. Lun a Vie 9–19 · Sáb 9–13." },
    ],
    primaryText: "¿Te indicaron una endodoncia? Te explicamos el tratamiento paso a paso y coordinamos el turno por WhatsApp.",
    headline: "Endodoncia en Córdoba", description: "Turno por WhatsApp",
    caption: "Una endodoncia es un tratamiento de conducto: se limpia el interior del diente y se sella. Antes de empezar te explicamos cada paso. Coordiná tu turno por WhatsApp en General Paz o Nueva Córdoba.",
    g: { headlines: ["Endodoncia en Córdoba", "Turno por WhatsApp", "Dos sedes en Córdoba"], longHeadline: "Endodoncia en General Paz y Nueva Córdoba. Te explicamos el tratamiento paso a paso.", descriptions: ["Tratamiento de conducto con anestesia local. Coordiná tu turno por WhatsApp.", "Lunes a viernes de 9 a 19 y sábados de 9 a 13. Elegí la sede que te quede cerca."] } },
  limpieza: { name: "Limpieza dental", photo: "limpieza-01", focal: "50% 40%",
    frames: [{ titular: "Limpieza dental con turno por *WhatsApp*.", cuerpo: "Elegí la sede: General Paz o Nueva Córdoba." }, { titular: "Dos sedes en *Córdoba*.", cuerpo: "Lun a Vie 9–19 · Sáb 9–13." }, { titular: "Sacá turno por *WhatsApp*.", cuerpo: "Te respondemos y coordinamos el horario." }],
    primaryText: "Limpieza dental en Córdoba. Sacá turno por WhatsApp en General Paz o Nueva Córdoba. Lun a Vie 9–19 y Sáb 9–13.",
    headline: "Limpieza dental · Turno por WhatsApp", description: "Dos sedes en Córdoba",
    caption: "Limpieza dental en General Paz y Nueva Córdoba. Sacá turno por WhatsApp y elegí el horario que te quede bien.",
    g: { headlines: ["Limpieza dental en Córdoba", "Turno por WhatsApp"], longHeadline: "Limpieza dental en General Paz y Nueva Córdoba. Sacá turno por WhatsApp.", descriptions: ["Atendemos adultos y chicos. Lunes a viernes de 9 a 19 y sábados de 9 a 13."] } },
  odontopediatria: { name: "Odontopediatría", photo: "pediatria-01", focal: "50% 45%",
    frames: [{ titular: "Odontología para *chicos*, con tiempo.", cuerpo: "Atendemos a los más chicos en dos sedes." }, { titular: "Una consulta *tranquila*.", cuerpo: "Les explicamos todo antes de empezar." }, { titular: "Coordiná por *WhatsApp*.", cuerpo: "General Paz o Nueva Córdoba." }],
    primaryText: "Turnos de odontopediatría en General Paz y Nueva Córdoba. Coordiná por WhatsApp y elegí el horario que te quede bien.",
    headline: "Odontopediatría en dos sedes", description: "Turno por WhatsApp",
    caption: "Atendemos a los más chicos en General Paz y Nueva Córdoba. Coordiná el turno por WhatsApp.",
    g: { headlines: ["Odontopediatría en Córdoba", "Dentista para chicos"], longHeadline: "Atención odontológica para chicos en General Paz y Nueva Córdoba. Coordiná por WhatsApp.", descriptions: ["Turnos de lunes a sábado. Consultá por WhatsApp y elegí la sede que te quede cerca."] } },
  ortodoncia: { name: "Ortodoncia", photo: "brackets-02", focal: "55% 45%",
    frames: [{ titular: "Ortodoncia, explicada *paso a paso*.", cuerpo: "En la primera consulta evaluamos tu caso." }, { titular: "Opciones, tiempos y *costos*.", cuerpo: "Te contamos todo antes de decidir." }, { titular: "Consultá por *WhatsApp*.", cuerpo: "General Paz o Nueva Córdoba." }],
    primaryText: "¿Pensás en ortodoncia? En la primera consulta evaluamos tu caso y te explicamos opciones, tiempos y costos.",
    headline: "Ortodoncia en Córdoba, paso a paso", description: "Primera consulta",
    caption: "En la primera consulta de ortodoncia evaluamos tu caso y te explicamos opciones, tiempos y costos. Consultá por WhatsApp.",
    g: { headlines: ["Ortodoncia en Córdoba", "Consultá por WhatsApp"], longHeadline: "Primera consulta de ortodoncia: evaluamos tu caso y te explicamos opciones y tiempos.", descriptions: ["Ortodoncia en General Paz y Nueva Córdoba. Consultá por WhatsApp."] } },
};

function mockGenerate(prompt) {
  const p = prompt.toLowerCase();
  const tk = /endodon|conducto/.test(p) ? "endodoncia" : /chic|niñ|pediatr/.test(p) ? "odontopediatria" : /ortodon|bracket/.test(p) ? "ortodoncia" : "limpieza";
  const t = TREATMENTS[tk];
  const sede = /nueva c/.test(p) ? "nueva-cordoba" : /general paz/.test(p) ? "general-paz" : "ambas";
  const kind = /reel/.test(p) ? "reel" : /stor/.test(p) ? "story" : /google|display/.test(p) ? "google" : "feed";
  const formats = { reel: ["meta-reels"], story: ["meta-stories"], google: ["google-display-191x1", "google-display-1x1", "google-display-4x5"], feed: ["meta-feed-4x5", "meta-feed-1x1", "meta-stories"] }[kind];
  const layout = kind === "reel" ? "veil" : tk === "ortodoncia" ? "flat" : tk === "odontopediatria" ? "dark" : "veil";
  const frames = (kind === "reel" ? t.frames : t.frames.slice(0, 1)).map((f, i) => ({ ...f, durationSec: kind === "reel" ? [3, 3, 4][i] : null }));
  return {
    id: "ad_" + Math.random().toString(36).slice(2, 8),
    request: prompt, kind, platform: kind === "google" ? "google" : "meta", treatment: t.name,
    layout, formats, photo: { id: t.photo, focal: t.focal },
    slots: { kicker: t.name, cta: kind === "google" || tk === "ortodoncia" ? "Consultar por WhatsApp" : "Sacar turno", sede },
    frames,
    legal: { condiciones: "" },
    meta: { primaryText: t.primaryText, headline: t.headline, description: t.description, callToAction: "WHATSAPP_MESSAGE", destination: sede === "nueva-cordoba" ? "+54 9 351 258-4060" : "+54 351 688-6431" },
    reel: kind === "reel" ? { caption: t.caption, onScreenNote: "Texto en pantalla = titular de cada escena", audio: "Música instrumental suave de la biblioteca de Meta (sin voz)" } : null,
    google: t.g,
    rationale: `Detecté ${t.name.toLowerCase()} · ${kind}. Layout ${layout} para ${kind === "reel" ? "que el titular se lea sobre la foto" : "este tipo de campaña"}.`,
  };
}
window.mockGenerate = mockGenerate;
