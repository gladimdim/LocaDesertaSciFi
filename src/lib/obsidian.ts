// Reads the Obsidian vault in content/ and turns Obsidian-flavoured Markdown
// into plain Markdown: [[wikilinks]], ![[embeds|480]] and relative asset paths
// become absolute site URLs. Non-markdown files are served under /media/.
import fs from "node:fs"
import path from "node:path"
import { parse as parseYaml } from "yaml"

const IGNORE = new Set([".obsidian", "private", "templates"])

export interface VaultNote {
  id: string
  filePath: string
  raw: string
  body: string
  data: Record<string, unknown>
}

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (IGNORE.has(e.name) || e.name.startsWith(".")) return []
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })

export const listAssets = (src: string) =>
  walk(src)
    .map((p) => path.relative(src, p))
    .filter((f) => !f.endsWith(".md"))

// Quartz-compatible slug: strip .md, whitespace -> '-', keep case; folder index -> folder
export const slugify = (s: string) =>
  s.replace(/\s/g, "-").replace(/&/g, "-and-").replace(/%/g, "-percent").replace(/\?/g, "").replace(/#/g, "")
export const slugOf = (rel: string) => {
  const s = slugify(rel.replace(/\.md$/, "").split(path.sep).join("/"))
  return s === "index" ? "" : s.replace(/\/index$/, "")
}
export const LANGS = ["uk", "en", "de"] as const
export type Lang = (typeof LANGS)[number]
const url = (slug: string) => "/" + slug.split("/").map(encodeURIComponent).join("/") + (slug ? "/" : "")
const mediaUrl = (rel: string) => "/media/" + rel.split(path.sep).map(encodeURIComponent).join("/")
const isImg = (s: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(s)

// untagged code fences get a language guessed from the note's tags
const fenceLang = (tags: string[]) => {
  const t = tags.join(" ").toLowerCase()
  return /dart|flutter/.test(t) ? "dart" : /unity|c#|csharp/.test(t) ? "csharp" : /reasonml/.test(t) ? "ocaml" : ""
}

export function readVault(src: string): VaultNote[] {
  const files = walk(src).map((p) => path.relative(src, p))
  const mdFiles = files.filter((f) => f.endsWith(".md"))
  const mdSet = new Set(mdFiles)
  const assets = files.filter((f) => !f.endsWith(".md"))
  const assetSet = new Set(assets)

  const byBase = new Map<string, string>()
  for (const f of mdFiles) {
    const b = path.basename(f, ".md").toLowerCase()
    const prev = byBase.get(b)
    if (!prev || f.split("/").length < prev.split("/").length) byBase.set(b, f)
  }
  const assetByName = new Map<string, string>()
  for (const a of assets) {
    const b = path.basename(a).toLowerCase()
    if (!assetByName.has(b)) assetByName.set(b, a)
  }

  const resolveNote = (target: string, from: string) => {
    target = target.trim().replace(/\.md$/, "")
    const cand = [
      path.normalize(path.join(path.dirname(from), target)) + ".md",
      path.normalize(target) + ".md",
      path.normalize(path.join(path.dirname(from), target, "index.md")),
      path.normalize(path.join(target, "index.md")),
    ]
    return cand.find((c) => mdSet.has(c)) ?? byBase.get(path.basename(target).toLowerCase())
  }

  const resolveAsset = (target: string, from: string) => {
    try {
      target = decodeURIComponent(target.trim())
    } catch {}
    const rel = path.normalize(path.join(path.dirname(from), target))
    if (assetSet.has(rel)) return rel
    if (assetSet.has(path.normalize(target))) return path.normalize(target)
    return assetByName.get(path.basename(target).toLowerCase())
  }

  const convertText = (chunk: string, from: string) => {
    // embeds ![[file|size]]
    chunk = chunk.replace(/!\[\[([^\]|]+)(?:\\?\|([^\]]*))?\]\]/g, (_m, t: string, opt?: string) => {
      const a = /\.\w+$/.test(t) ? resolveAsset(t, from) : undefined
      if (a) {
        const w = opt && /^\d+$/.test(opt) ? ` width="${opt}"` : ""
        return isImg(a)
          ? `<img src="${mediaUrl(a)}" alt="${path.basename(t)}"${w} loading="lazy">`
          : `[${path.basename(t)}](${mediaUrl(a)})`
      }
      const n = resolveNote(t.split("#")[0], from)
      return n ? `[${t}](${url(slugOf(n))})` : t
    })
    // wikilinks [[target#heading|alias]] — the pipe is escaped inside tables
    chunk = chunk.replace(/\[\[([^\]|\\]+?)(?:\\?\|([^\]]*))?\]\]/g, (_m, t: string, alias?: string) => {
      const [p, h] = t.split("#")
      const n = p ? resolveNote(p, from) : from
      const label = alias ?? (h || path.basename(p))
      if (!n) return label
      return `[${label}](${url(slugOf(n))}${h ? "#" + h.toLowerCase().replace(/\s+/g, "-") : ""})`
    })
    // markdown links/images pointing at local files
    chunk = chunk.replace(/(!?\[[^\]]*\])\(([^)\s]+)(\s+"[^"]*")?\)/g, (m, lbl: string, t: string, title = "") => {
      if (/^(https?:|mailto:|#|\/)/.test(t)) return m
      const a = resolveAsset(t.split("#")[0], from)
      if (a) return `${lbl}(${mediaUrl(a)}${title})`
      let target = t.split("#")[0]
      try {
        target = decodeURIComponent(target)
      } catch {}
      const n = resolveNote(target, from)
      return n ? `${lbl}(${url(slugOf(n))})` : m
    })
    // raw html src="relative.svg"
    return chunk.replace(/src="([^":]+)"/g, (m, t: string) => {
      if (t.startsWith("/")) return m
      const a = resolveAsset(t, from)
      return a ? `src="${mediaUrl(a)}"` : m
    })
  }

  const convertBody = (body: string, from: string, lang: string) =>
    body
      .split(/(^[ \t]*```[^\n]*\n[\s\S]*?^[ \t]*```[ \t]*$)/m)
      .map((chunk, i) => {
        if (i % 2 === 0) return convertText(chunk, from)
        return chunk.replace(/^([ \t]*```)(\S*)/, (_m, f: string, l: string) =>
          l === "reasonml" ? f + "ocaml" : !l && lang ? f + lang : f + l,
        )
      })
      .join("")

  return mdFiles.map((rel) => {
    const raw = fs.readFileSync(path.join(src, rel), "utf8")
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
    let data: Record<string, unknown> = {}
    try {
      data = (fm && parseYaml(fm[1])) || {}
    } catch (e) {
      console.warn(`[vault] bad frontmatter in ${rel}: ${(e as Error).message}`)
    }
    let body = fm ? raw.slice(fm[0].length) : raw
    const tags = Array.isArray(data.tags) ? data.tags.map(String) : []
    body = convertBody(body, rel, fenceLang(tags))

    const parts = rel.split(path.sep)
    const pathLang = parts[0] === "en" || parts[0] === "de" ? parts[0] : "uk"
    data.lang = typeof data.lang === "string" && data.lang ? data.lang : pathLang
    const inner = pathLang === "uk" ? parts : parts.slice(1)
    data.section = inner.length > 1 ? inner[0] : "" // Books / Всесвіт / Universe / Ігри / Games / Spiele
    data.isIndex = path.basename(rel) === "index.md"
    // "Books/X/X.md" is the folder's main note (Obsidian folder-note convention)
    data.isFolderNote = parts.length > 1 && path.basename(rel, ".md") === parts[parts.length - 2]
    data.folder = slugify(parts.slice(0, -1).join("/"))
    // translations: { en: "/en/Universe/..." } -> { en: "en/Universe/..." } (note ids)
    if (data.translations && typeof data.translations === "object") {
      const t: Record<string, string> = {}
      for (const [k, v] of Object.entries(data.translations as Record<string, unknown>))
        if (typeof v === "string" && v) t[k] = slugify(decodeURI(v)).replace(/^\/+|\/+$/g, "").replace(/\.html$/, "") || "index"
      data.translations = t
    }
    if (!data.title) {
      const h = body.match(/^#\s+(.+)$/m)
      const line = body.split("\n").find((l) => l.trim() && !l.startsWith("<") && !l.startsWith("!"))
      data.title = h ? h[1].trim() : line ? line.trim().slice(0, 80) : path.basename(rel, ".md")
    }
    if (!data.date) {
      const d = path.basename(rel).match(/^(\d{4}-\d{2}-\d{2})/)
      if (d) data.date = d[1]
    }
    if (typeof data.thumbnail === "string" && data.thumbnail) {
      const a = resolveAsset(data.thumbnail, rel)
      if (a) data.thumbnail = mediaUrl(a)
      else delete data.thumbnail
    } else delete data.thumbnail
    if (!data.thumbnail) {
      const img = body.match(/(?:\]\(|src=")(\/media\/[^)"\s]+)/)
      if (img) data.cover = img[1]
    }
    delete data.slug
    return { id: slugOf(rel) || "index", filePath: rel, raw, body, data }
  })
}
