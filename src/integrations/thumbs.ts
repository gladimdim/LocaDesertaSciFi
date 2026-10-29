import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { AstroIntegration } from "astro"
import sharp from "sharp"
import { listAssets } from "../lib/obsidian"

// Downscaled WebP copies of the vault artwork for cards and heroes:
// /thumbs/<480|1280>/<path in vault>.webp. Generated on demand in dev, all at once at build.
const WIDTHS = [480, 1280]
const isImg = (f: string) => /\.(png|jpe?g|webp)$/i.test(f)

async function render(src: string, w: number) {
  return sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: w > 600 ? 78 : 72 }).toBuffer()
}

export function thumbs(dir: string): AstroIntegration {
  const root = path.resolve(dir)
  const cache = new Map<string, Buffer>()
  const source = (rel: string) => {
    const base = rel.replace(/\.webp$/, "")
    for (const ext of [".png", ".jpg", ".jpeg", ".webp", ".PNG", ".JPG", ".JPEG"]) {
      const f = path.join(root, base + ext)
      if (f.startsWith(root + path.sep) && fs.existsSync(f)) return f
    }
  }
  return {
    name: "vault-thumbs",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use("/thumbs", async (req, res, next) => {
          const m = decodeURIComponent((req.url ?? "").split("?")[0]).match(/^\/(\d+)\/(.+\.webp)$/)
          if (!m || !WIDTHS.includes(+m[1])) return next()
          const src = source(m[2])
          if (!src) return next()
          const key = m[1] + m[2]
          try {
            if (!cache.has(key)) cache.set(key, await render(src, +m[1]))
            res.setHeader("content-type", "image/webp")
            res.end(cache.get(key))
          } catch {
            next()
          }
        })
      },
      "astro:build:done": async ({ dir: out, logger }) => {
        const dest = path.join(fileURLToPath(out), "thumbs")
        const imgs = listAssets(root).filter(isImg)
        let n = 0
        await Promise.all(
          Array.from({ length: 6 }, async (_, worker) => {
            for (let i = worker; i < imgs.length; i += 6)
              for (const w of WIDTHS) {
                const file = path.join(dest, String(w), imgs[i].replace(/\.(png|jpe?g|webp)$/i, ".webp"))
                fs.mkdirSync(path.dirname(file), { recursive: true })
                try {
                  fs.writeFileSync(file, await render(path.join(root, imgs[i]), w))
                  n++
                } catch (e) {
                  logger.warn(`thumb failed ${imgs[i]}: ${(e as Error).message}`)
                }
              }
          }),
        )
        logger.info(`generated ${n} thumbnails`)
      },
    },
  }
}
