import { allNotes, noteUrl, summary, displayTitle } from "../lib/notes"
import { SITE } from "../lib/site"

const esc = (s = "") => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// RSS of the books and codex entries (no dates in the vault, so newest-first is not meaningful)
export async function GET({ site }: { site: URL }) {
  const items = (await allNotes())
    .filter((n) => n.id !== "index" && n.id !== "en")
    .sort((a, b) => Number(b.data.section === "Books") - Number(a.data.section === "Books"))
    .map((n) => {
      const link = new URL(noteUrl(n.id), site).href
      return `<item><title>${esc(displayTitle(n))}</title><link>${link}</link><guid>${link}</guid><category>${esc(n.data.section)}</category><description>${esc(summary(n))}</description></item>`
    })
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE.name}</title><link>${site.href}</link><description>Codex and books of the Loca Deserta Sci-Fi universe</description><language>uk</language>${items.join("")}</channel></rss>`, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  })
}
