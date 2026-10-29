import { allNotes, noteUrl, plain, summary, displayTitle, imageOf, thumb } from "../lib/notes"

export async function GET() {
  const notes = await allNotes()
  const items = notes.map((n) => ({
    t: displayTitle(n),
    u: noteUrl(n.id),
    l: n.data.lang,
    i: thumb(imageOf(n, notes)),
    p: summary(n, 110),
    x: plain(n.body).slice(0, 2500),
  }))
  return new Response(JSON.stringify(items), { headers: { "content-type": "application/json" } })
}
