// 1200×630 social preview cards in the "command deck" style: artwork on the right,
// HUD frame with corner brackets, Unbounded titles. Rendered with satori → resvg at build.
import fs from "node:fs"
import path from "node:path"
import satori from "satori"
import sharp from "sharp"
import { Resvg } from "@resvg/resvg-js"

const font = (pkg: string, file: string) => fs.readFileSync(path.resolve("node_modules/@fontsource", pkg, "files", file))
const FONTS = ["latin", "cyrillic"].flatMap((s) => [
  { name: `Unb-${s}`, data: font("unbounded", `unbounded-${s}-800-normal.woff`), weight: 800 as const },
  { name: `Inter-${s}`, data: font("inter", `inter-${s}-500-normal.woff`), weight: 500 as const },
  { name: `Mono-${s}`, data: font("jetbrains-mono", `jetbrains-mono-${s}-500-normal.woff`), weight: 500 as const },
])
const DISPLAY = "Unb-latin, Unb-cyrillic"
const SANS = "Inter-latin, Inter-cyrillic"
const MONO = "Mono-latin, Mono-cyrillic"

const ACCENT: Record<string, [string, string]> = {
  hetman: ["#3ea6ff", "#ffcf4a"],
  corp: ["#ff4d6d", "#c9d6ea"],
  sun: ["#ff8f1f", "#ffd75e"],
  europa: ["#3fe0c5", "#9fd8ff"],
  deck: ["#3ea6ff", "#ffcf4a"],
}

type Node = { type: string; props: Record<string, unknown> }
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat().filter((c) => c !== null && c !== undefined && c !== false) },
})

// artwork → small JPEG data URI (satori can't decode webp, and full-size PNGs are slow)
async function art(mediaUrl?: string) {
  if (!mediaUrl?.startsWith("/media/")) return
  let rel: string
  try {
    rel = decodeURIComponent(mediaUrl.slice(7))
  } catch {
    return
  }
  const file = path.resolve("content", rel)
  if (!fs.existsSync(file)) return
  try {
    const buf = await sharp(file).resize({ width: 760, height: 630, fit: "cover" }).jpeg({ quality: 80 }).toBuffer()
    return `data:image/jpeg;base64,${buf.toString("base64")}`
  } catch {
    return
  }
}

export interface Card {
  kicker: string
  title: string
  description?: string
  image?: string
  faction?: string
  footer?: string
}

const clamp = (s = "", n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s)

export async function renderCard(card: Card) {
  const [a1, a2] = ACCENT[card.faction ?? "deck"] ?? ACCENT.deck
  const img = await art(card.image)
  const title = clamp(card.title, 64)
  const size = title.length > 40 ? 46 : title.length > 22 ? 58 : 72
  const bracket = (pos: Record<string, number>) => [
    h("div", { position: "absolute", ...pos, width: 34, height: 3, background: a2 }),
    h("div", { position: "absolute", ...pos, width: 3, height: 34, background: a2 }),
  ]
  const tree = h(
    "div",
    { width: 1200, height: 630, background: "#03050b", position: "relative", fontFamily: SANS, color: "#e7edf8", overflow: "hidden" },
    img ? { type: "img", props: { src: img, width: 760, height: 630, style: { position: "absolute", right: 0, top: 0, width: 760, height: 630, objectFit: "cover" } } } : null,
    h("div", { position: "absolute", left: 0, top: 0, width: 1200, height: 630, backgroundImage: "linear-gradient(90deg, #03050b 0%, #03050b 38%, rgba(3,5,11,0.82) 55%, rgba(3,5,11,0.15) 100%)" }),
    h("div", { position: "absolute", left: 0, top: 0, width: 1200, height: 630, backgroundImage: `radial-gradient(circle at 0% 100%, ${a1}33, transparent 45%)` }),
    // frame + corner brackets
    h("div", { position: "absolute", left: 30, top: 30, width: 1140, height: 570, border: `1px solid ${a1}55` }),
    ...bracket({ left: 30, top: 30 }),
    h("div", { position: "absolute", right: 30, top: 30, width: 34, height: 3, background: a2 }),
    h("div", { position: "absolute", right: 30, top: 30, width: 3, height: 34, background: a2 }),
    h("div", { position: "absolute", left: 30, bottom: 30, width: 34, height: 3, background: a2 }),
    h("div", { position: "absolute", left: 30, bottom: 30, width: 3, height: 34, background: a2 }),
    h("div", { position: "absolute", right: 30, bottom: 30, width: 34, height: 3, background: a2 }),
    h("div", { position: "absolute", right: 30, bottom: 30, width: 3, height: 34, background: a2 }),
    h(
      "div",
      { position: "absolute", left: 76, top: 74, width: 640, height: 482, flexDirection: "column", justifyContent: "space-between" },
      h(
        "div",
        { flexDirection: "column" },
        h("div", { alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: a1, textTransform: "uppercase" }, h("div", { width: 10, height: 10, background: a1 }), clamp(card.kicker, 46)),
        h("div", { fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.04, marginTop: 26, textTransform: "uppercase", letterSpacing: -1 }, title),
        h("div", { width: 90, height: 4, marginTop: 26, backgroundImage: `linear-gradient(90deg, ${a2}, ${a1})` }),
        card.description ? h("div", { fontSize: 25, lineHeight: 1.45, color: "#a7b6d0", marginTop: 24 }, clamp(card.description, 150)) : null,
      ),
      h(
        "div",
        { alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 19, color: "#a7b6d0", letterSpacing: 2 },
        h("div", { fontFamily: DISPLAY, fontWeight: 800, color: a2, fontSize: 20, letterSpacing: 3 }, "LOCA DESERTA"),
        card.footer ?? "scifi.locadeserta.com",
      ),
    ),
  )
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts: FONTS })
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng()
  // artwork-heavy cards are ~1MB as PNG; JPEG keeps them ~100KB for chat apps and the Pages artifact
  return sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer()
}
