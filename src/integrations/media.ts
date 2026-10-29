import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { AstroIntegration } from "astro"
import { listAssets } from "../lib/obsidian"

const TYPES: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".avif": "image/avif", ".mp4": "video/mp4",
  ".pdf": "application/pdf",
}

// Serves every non-markdown file of the vault under /media/ (dev) and copies them into the build.
export function media(dir: string): AstroIntegration {
  const src = path.resolve(dir)
  return {
    name: "vault-media",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use("/media", (req, res, next) => {
          let rel: string
          try {
            rel = decodeURIComponent((req.url ?? "").split("?")[0])
          } catch {
            return next()
          }
          const file = path.join(src, rel)
          if (!file.startsWith(src + path.sep) || file.endsWith(".md") || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
          res.setHeader("content-type", TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream")
          fs.createReadStream(file).pipe(res)
        })
      },
      "astro:build:done": ({ dir: out, logger }) => {
        const dest = path.join(fileURLToPath(out), "media")
        const assets = listAssets(src)
        for (const a of assets) {
          fs.mkdirSync(path.dirname(path.join(dest, a)), { recursive: true })
          fs.copyFileSync(path.join(src, a), path.join(dest, a))
        }
        logger.info(`copied ${assets.length} media files`)
      },
    },
  }
}
