"use client";

import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { domToCanvas } from "modern-screenshot";
import JSZip from "jszip";
import { AdTemplate, type AdTemplateProps } from "@/components/ad/AdTemplate";
import { AD_FORMATS, type AdFormat } from "./formats";
import { copyText } from "./package";
import type { AdSpec, SettingsRow } from "./spec";

const FPS = 30;
const CROSSFADE = 0.3;
const KEN_BURNS = 0.04;
const MB = 1024 * 1024;

export interface ExportInput {
  adId: string;
  request: string;
  spec: AdSpec;
  settings: SettingsRow;
  photoSrc?: string;
  focal: string;
  onProgress?: (msg: string) => void;
}

function slotsFor(input: ExportInput, frame: number): AdTemplateProps {
  const { spec, settings } = input;
  const f = spec.frames[frame] ?? spec.frames[0];
  return {
    layout: spec.layout, kicker: spec.slots.kicker, titular: f.titular, cuerpo: f.cuerpo,
    foto: input.photoSrc, focal: input.focal, sede: spec.slots.sede, cta: spec.slots.cta,
    director: settings.director, matricula: settings.matricula, condiciones: spec.legal.condiciones || undefined,
  };
}

/** Render one ad at native size off-screen and capture it. */
async function capture(props: AdTemplateProps & { format: AdFormat }) {
  const { w, h } = AD_FORMATS[props.format];
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-${w + 200}px;top:0;width:${w}px;height:${h}px;pointer-events:none;`;
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<AdTemplate {...props} />));
    await document.fonts.ready;
    await Promise.all([...host.querySelectorAll("img")].map((img) => img.decode().catch(() => undefined)));
    const node = host.firstElementChild as HTMLElement;
    const canvas = await domToCanvas(node, { width: w, height: h, scale: 1, backgroundColor: props.photoHole ? null : "#f6fafa" });
    let photo: { x: number; y: number; w: number; h: number; radius: number; veil: number[] | null } | null = null;
    const el = host.querySelector<HTMLElement>("[data-ad-photo]");
    if (el) {
      const r = el.getBoundingClientRect(), base = node.getBoundingClientRect();
      const veil = el.dataset.veil ? el.dataset.veil.split(",").map(Number) : null;
      photo = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height, radius: parseFloat(el.style.borderRadius) || 0, veil };
    }
    return { canvas, photo };
  } finally {
    root.unmount();
    host.remove();
  }
}

const toBlob = (c: HTMLCanvasElement, type: string, q?: number) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), type, q));

/** PNG, or JPG 85 when over the platform's size limit (Google 5 MB, Meta 30 MB). */
async function encodeStill(canvas: HTMLCanvasElement, format: AdFormat) {
  const limit = format.startsWith("google") ? 5 * MB : 30 * MB;
  const png = await toBlob(canvas, "image/png");
  if (png.size <= limit) return { blob: png, ext: "png" };
  return { blob: await toBlob(canvas, "image/jpeg", 0.85), ext: "jpg" };
}

async function loadImage(src: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  return img;
}

async function pickCodec(w: number, h: number) {
  if (typeof VideoEncoder === "undefined") return null;
  for (const codec of ["avc1.640028", "avc1.4d0028", "avc1.42003e"]) {
    const config: VideoEncoderConfig = { codec, width: w, height: h, bitrate: 8_000_000, framerate: FPS, avc: { format: "avc" } };
    const { supported } = await VideoEncoder.isConfigSupported(config).catch(() => ({ supported: false }));
    if (supported) return config;
  }
  return null;
}

/**
 * Reels: each frame is a scene of durationSec, 300 ms crossfade between scenes, photo scaled
 * 1.00→1.04 per scene. The text layer is captured once per scene with an empty photo box and
 * composited over the photo, so the Ken Burns never moves the copy.
 */
async function encodeReel(input: ExportInput, format: AdFormat, onProgress: (m: string) => void): Promise<Blob | null> {
  const { w, h } = AD_FORMATS[format];
  const config = await pickCodec(w, h);
  if (!config) return null;
  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");

  const img = input.photoSrc ? await loadImage(input.photoSrc) : null;
  const scenes: (Awaited<ReturnType<typeof capture>> & { dur: number })[] = [];
  for (let i = 0; i < input.spec.frames.length; i++) {
    onProgress(`Preparando escena ${i + 1} del reel`);
    const layer = img ? await capture({ ...slotsFor(input, i), format, photoHole: true }) : await capture({ ...slotsFor(input, i), format });
    scenes.push({ ...layer, dur: input.spec.frames[i].durationSec ?? 3 });
  }
  const [fx, fy] = input.focal.split(" ").map((v) => parseFloat(v) / 100);
  const baseFill = input.spec.layout === "dark" ? "#22343a" : "#f6fafa";

  const sceneCanvas = document.createElement("canvas");
  sceneCanvas.width = w; sceneCanvas.height = h;
  const sctx = sceneCanvas.getContext("2d")!;
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  const ctx = out.getContext("2d")!;

  const drawScene = (i: number, t: number) => {
    const sc = scenes[i];
    if (!img || !sc.photo) { sctx.drawImage(sc.canvas, 0, 0); return; }
    const k = 1 + KEN_BURNS * Math.min(1, Math.max(0, t / sc.dur));
    const p = sc.photo;
    sctx.fillStyle = baseFill;
    sctx.fillRect(0, 0, w, h);
    sctx.save();
    sctx.beginPath();
    sctx.roundRect(p.x, p.y, p.w, p.h, p.radius);
    sctx.clip();
    sctx.fillStyle = "#cfe6e6";
    sctx.fillRect(p.x, p.y, p.w, p.h);
    const cover = Math.max(p.w / img.naturalWidth, p.h / img.naturalHeight) * k;
    const dw = img.naturalWidth * cover, dh = img.naturalHeight * cover;
    sctx.drawImage(img, p.x + (p.w - dw) * fx, p.y + (p.h - dh) * fy, dw, dh);
    if (p.veil) {
      const g = sctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      g.addColorStop(0, `rgba(34,52,58,${p.veil[0]})`);
      g.addColorStop(1, `rgba(34,52,58,${p.veil[1]})`);
      sctx.fillStyle = g;
      sctx.fillRect(p.x, p.y, p.w, p.h);
    }
    sctx.restore();
    sctx.drawImage(sc.canvas, 0, 0);
  };

  const starts = scenes.reduce<number[]>((a, s, i) => [...a, i ? a[i - 1] + scenes[i - 1].dur : 0], []);
  const total = starts[starts.length - 1] + scenes[scenes.length - 1].dur;
  const frames = Math.round(total * FPS);

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: "avc", width: w, height: h, frameRate: FPS }, fastStart: "in-memory" });
  let failure: unknown = null;
  const encoder = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { failure = e; } });
  encoder.configure(config);

  for (let n = 0; n < frames; n++) {
    if (failure) throw failure;
    const t = n / FPS;
    let i = starts.findLastIndex((s) => s <= t);
    if (i < 0) i = 0;
    drawScene(i, t - starts[i]);
    ctx.globalAlpha = 1;
    ctx.drawImage(sceneCanvas, 0, 0);
    // Crossfade centred on each cut
    const next = i + 1 < scenes.length ? starts[i + 1] : Infinity;
    const prev = starts[i];
    if (next - t < CROSSFADE / 2 || (i > 0 && t - prev < CROSSFADE / 2)) {
      const into = next - t < CROSSFADE / 2 ? i + 1 : i;
      const from = into - 1;
      const cut = starts[into];
      const a = 0.5 + (t - cut) / CROSSFADE; // 0 → 1 across the window
      drawScene(from, t - starts[from]);
      ctx.globalAlpha = 1;
      ctx.drawImage(sceneCanvas, 0, 0);
      drawScene(into, Math.max(0, t - starts[into]));
      ctx.globalAlpha = Math.min(1, Math.max(0, a));
      ctx.drawImage(sceneCanvas, 0, 0);
      ctx.globalAlpha = 1;
    }
    const vf = new VideoFrame(out, { timestamp: Math.round((n * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
    encoder.encode(vf, { keyFrame: n % (FPS * 2) === 0 });
    vf.close();
    if (encoder.encodeQueueSize > 8) await new Promise<void>((r) => encoder.addEventListener("dequeue", () => r(), { once: true }));
    if (n % FPS === 0) onProgress(`Codificando el reel · ${Math.round((n / frames) * 100)} %`);
  }
  await encoder.flush();
  encoder.close();
  if (failure) throw failure;
  muxer.finalize();
  return new Blob([target.buffer], { type: "video/mp4" });
}

export async function buildPackage(input: ExportInput) {
  const progress = input.onProgress ?? (() => undefined);
  const { spec } = input;
  const zip = new JSZip();
  const files: { format: AdFormat; file: string; w: number; h: number; scene?: number }[] = [];
  const notes: string[] = [];

  for (const format of spec.formats) {
    const { w, h } = AD_FORMATS[format];
    if (format === "meta-reels" && spec.kind === "reel") {
      for (let i = 0; i < spec.frames.length; i++) {
        progress(`Renderizando escena ${i + 1} · ${w}×${h}`);
        const { canvas } = await capture({ ...slotsFor(input, i), format });
        const { blob, ext } = await encodeStill(canvas, format);
        const file = `scene-${i + 1}.${ext}`;
        zip.file(file, blob);
        files.push({ format, file, w, h, scene: i + 1 });
      }
      const mp4 = await encodeReel(input, format, progress);
      if (mp4) {
        zip.file("reel.mp4", mp4);
        files.push({ format, file: "reel.mp4", w, h });
      } else {
        notes.push("Este navegador no puede codificar MP4 (H.264). Se incluyen las escenas en PNG; probá con Chrome, Edge o Safari actualizados para el video.");
      }
      continue;
    }
    progress(`Renderizando ${AD_FORMATS[format].label} · ${w}×${h}`);
    const { canvas } = await capture({ ...slotsFor(input, 0), format });
    const { blob, ext } = await encodeStill(canvas, format);
    const file = `${format}.${ext}`;
    zip.file(file, blob);
    files.push({ format, file, w, h });
  }

  progress("Armando el paquete");
  zip.file("copy.txt", copyText(spec, input.settings, input.request) + (notes.length ? `\nNOTAS\n${notes.join("\n")}\n` : ""));
  zip.file("ad.json", JSON.stringify({
    id: input.adId,
    request: input.request,
    spec,
    render: { exportedAt: new Date().toISOString(), photo: { id: spec.photo.id, url: input.photoSrc ?? null, focal: input.focal }, files, fps: spec.kind === "reel" ? FPS : undefined },
  }, null, 2));
  const blob = await zip.generateAsync({ type: "blob" });
  return { blob, notes };
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
