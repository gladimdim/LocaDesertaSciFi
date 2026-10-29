import type { APIRoute } from "astro"
import { allNotes, noteUrl, summary, displayTitle, type Note } from "../lib/notes"

// Markdown twin of every page (/Books/X/X.md), linked from llms.txt
export async function getStaticPaths() {
  return (await allNotes()).map((n) => ({ params: { slug: n.id }, props: { note: n } }))
}

export const GET: APIRoute = ({ props, site }) => {
  const n = (props as { note: Note }).note
  const fm = ["---", `title: ${JSON.stringify(displayTitle(n))}`, `url: ${new URL(noteUrl(n.id), site).href}`, `lang: ${n.data.lang}`, `author: Dmytro Gladkyi`, `description: ${JSON.stringify(summary(n))}`, "---"]
  return new Response(fm.join("\n") + "\n\n" + (n.body ?? "").replace(/\]\(\//g, `](${site!.origin}/`), { headers: { "content-type": "text/markdown; charset=utf-8" } })
}
