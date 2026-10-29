import type { APIRoute } from "astro"
import { allNotes, folders, imageOf, summary, displayTitle, factionOf, isBook, wordCount } from "../../lib/notes"
import { renderCard, type Card } from "../../lib/og"
import { t, type Lang, entriesLabel } from "../../lib/site"
import { ART } from "../../lib/universe"

export async function getStaticPaths() {
  const notes = await allNotes()
  const ids = new Set(notes.map((n) => n.id))
  const out: { params: { slug: string }; props: Card }[] = []
  for (const l of ["uk", "en", "de"] as Lang[]) {
    const s = t(l)
    out.push({ params: { slug: l === "uk" ? "index" : l }, props: { kicker: s.heroKicker, title: `${s.heroTitle[0]} ${s.heroTitle[1]}`, description: s.heroLead, image: ART.hero, faction: "hetman" } })
  }
  for (const n of notes) {
    if (n.id === "index" || n.id === "en") continue
    const s = t(n.data.lang)
    const book = isBook(n)
    out.push({
      params: { slug: n.id },
      props: {
        kicker: book ? `${s.books} · ${wordCount(n).toLocaleString("en-US")} ${s.words}` : n.id.split("/").slice(0, -1).filter((p) => p !== "en" && p !== "de").slice(-2).join(" / ").replace(/-/g, " ") || s.codex,
        title: displayTitle(n),
        description: summary(n, 150),
        image: /Мюрид/.test(n.id) ? ART.murids : imageOf(n, notes),
        faction: factionOf(n.id),
      },
    })
  }
  for (const f of (await folders()).values()) {
    if (ids.has(f.id) || f.id === "de") continue
    const s = t(f.lang)
    const first = [...f.notes, ...(f.note ? [f.note] : [])][0]
    out.push({ params: { slug: f.id }, props: { kicker: s.codex, title: f.name, description: entriesLabel(f.lang, f.notes.length + f.folders.length), image: first ? imageOf(first, notes) : ART.hero, faction: factionOf(f.id) } })
  }
  return out
}

export const GET: APIRoute = async ({ props }) => new Response(await renderCard(props as Card), { headers: { "content-type": "image/jpeg" } })
