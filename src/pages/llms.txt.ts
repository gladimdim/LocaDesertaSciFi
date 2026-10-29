import { allNotes, noteUrl, summary, displayTitle, wordCount, isBook } from "../lib/notes"
import { SITE, t } from "../lib/site"

// https://llmstxt.org — a guide to the universe for AI assistants
export async function GET({ site }: { site: URL }) {
  const notes = await allNotes()
  const md = (id: string) => new URL(`/${id}.md`, site).href
  const line = (n: (typeof notes)[number]) => `- [${displayTitle(n)}](${md(n.id)}): ${summary(n, 200)}`
  const en = notes.filter((n) => n.data.lang === "en")
  const uk = notes.filter((n) => n.data.lang === "uk")
  const books = notes.filter(isBook)
  const body = `# ${SITE.name}

> ${t("en").description}

Loca Deserta Sci-Fi is a military science-fiction universe by the Ukrainian writer and game developer ${SITE.author}. Five centuries after the first crewed warp jump (year 0 of the Star Era = 2143), three empires split the galaxy at the Martian Partition (33 SE): the Hetmanate Federation (a Ukrainian Cossack civilisation, capital Star Sich in the Virgo Supercluster), the Corporate Republic (Star Washington, Centaurus) and the Empire of the Sun (Star Shanghai, Pisces–Cetus). The novels follow Hetmanate haiduks and Cossacks during the siege of the remote mining colony Wild Fields 17 (Loca Deserta 17, ~495 SE), the spark of the First Great War. The original language is Ukrainian (site root); English translations are under /en/ and one German page under /de/. Every page is available as Markdown by appending \`.md\` to its path; the whole corpus is at ${new URL("/llms-full.txt", site).href}.

## Books

${books.map((b) => `- [${displayTitle(b)}](${md(b.id)}) (${b.data.lang}, ${wordCount(b).toLocaleString("en-US")} words): ${summary(b, 220)}`).join("\n")}

## Codex (English)

${en.filter((n) => !isBook(n) && n.id !== "en").map(line).join("\n")}

## Codex (Ukrainian original)

${uk.filter((n) => !isBook(n) && n.id !== "index").map(line).join("\n")}

## Optional

- [Author's site](https://dmytrogladkyi.com): articles by ${SITE.author} on games, AI and developer tools.
- [Telegram channel](https://t.me/locadesertachumaki)
`
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } })
}
