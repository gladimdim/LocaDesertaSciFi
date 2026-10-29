import { allNotes, noteUrl, summary, displayTitle } from "../lib/notes"
import { SITE, t } from "../lib/site"

export async function GET({ site }: { site: URL }) {
  const parts = (await allNotes()).map((n) =>
    [`# ${displayTitle(n)}`, "", `URL: ${new URL(noteUrl(n.id), site).href}`, `Language: ${n.data.lang}`, `Summary: ${summary(n)}`, "", (n.body ?? "").replace(/\]\(\//g, `](${site.origin}/`).trim()].join("\n"),
  )
  return new Response(`# ${SITE.name}\n\n> ${t("en").description}\n\n---\n\n${parts.join("\n\n---\n\n")}\n`, { headers: { "content-type": "text/plain; charset=utf-8" } })
}
