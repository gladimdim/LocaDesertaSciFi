import { allNotes, folders, noteUrl, translations } from "../lib/notes"

// sitemap with hreflang alternates between translations
export async function GET({ site }: { site: URL }) {
  const notes = await allNotes()
  const ids = new Set(notes.map((n) => n.id))
  const abs = (id: string) => new URL(noteUrl(id), site).href
  const urls: string[] = []
  for (const n of notes) {
    const tr = await translations(n)
    const alt = Object.keys(tr).length > 1 ? Object.entries(tr).map(([l, id]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(id!)}"/>`).join("") : ""
    urls.push(`<url><loc>${abs(n.id)}</loc>${alt}</url>`)
  }
  urls.push(`<url><loc>${new URL("/de/", site).href}</loc></url>`)
  for (const f of (await folders()).values()) if (!ids.has(f.id) && f.id !== "de") urls.push(`<url><loc>${abs(f.id)}</loc></url>`)
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>`, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  })
}
