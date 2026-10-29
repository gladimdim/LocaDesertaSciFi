import path from "node:path"
import type { Loader } from "astro/loaders"
import { readVault } from "../lib/obsidian"

// Content loader over the Obsidian vault; reloads on any change in dev.
export function vault(dir: string): Loader {
  const src = path.resolve(dir)
  return {
    name: "obsidian-vault",
    load: async ({ store, parseData, renderMarkdown, generateDigest, watcher, logger }) => {
      const sync = async () => {
        const notes = readVault(src)
        store.clear()
        for (const n of notes) {
          const data = await parseData({ id: n.id, data: n.data, filePath: path.join(dir, n.filePath) })
          store.set({
            id: n.id,
            data,
            body: n.body,
            filePath: path.join(dir, n.filePath),
            digest: generateDigest(n.raw),
            rendered: await renderMarkdown(n.body),
          })
        }
        logger.info(`loaded ${notes.length} notes from ${dir}`)
      }
      await sync()
      if (!watcher) return
      watcher.add(src)
      let timer: ReturnType<typeof setTimeout> | undefined
      watcher.on("all", (_ev, p) => {
        if (!p.startsWith(src)) return
        clearTimeout(timer)
        timer = setTimeout(sync, 150)
      })
    },
  }
}
