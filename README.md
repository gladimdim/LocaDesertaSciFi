# Loca Deserta Sci-Fi Universe

Source of [scifi.locadeserta.com](https://scifi.locadeserta.com): the codex of the Loca Deserta sci-fi universe (empires, history, technologies, Jovian Europa), the books, and the Loca Deserta Settlers game.

The content is an Obsidian vault in `content/` (Ukrainian at the root, English in `content/en/`, German in `content/de/`). The site is built with [Astro](https://astro.build) and deployed to GitHub Pages from the `main` branch.

## Run locally

Requirements: Node.js 24 (see `.node-version`; Astro needs at least 22.23).

```bash
npm install
npm run dev        # http://localhost:4321, reloads when you edit notes in content/
```

Other commands:

```bash
npm run build      # static site in dist/ (~1–2 min: renders social cards and image thumbnails)
npm run preview    # serve dist/ at http://localhost:4321
npm run dev -- --port 4340 --host   # different port / expose on the LAN
```

## Writing

Write in Obsidian with `content/` as the vault. Obsidian syntax is converted at build time, the Markdown stays untouched:

- `[[note]]`, `[[Folder/note|alias]]`, `[[note#heading]]` become links; `![[image.png|500]]` embeds an image (the number is the width).
- Relative image paths (`../../Images/...`) work; every non-Markdown file is published under `/media/`, large images also get WebP thumbnails.
- A note named like its folder (`Books/Зоряний Гетьманат/Зоряний Гетьманат.md`) is that folder's main note. Books are single long notes; the reader splits them into chapters by headings.

Frontmatter:

```yaml
---
title: "Федерація Гетьманату"        # falls back to the file name
lang: "uk"                           # uk | en | de (defaults from the folder)
translationKey: "hetmanate-federation"
translations:                        # links the language switcher and hreflang
  en: "/en/Universe/Empires/Hetmanate-Federation/Hetmanate-Federation"
description: "Shown in search results, cards and link previews."
aliases: ["Гетьманат"]               # old names; each gets a redirect page
---
```

URLs follow the file path with spaces turned into `-`: `content/Всесвіт/Технології/Варп/Варп.md` → `/Всесвіт/Технології/Варп/Варп/`. Every folder also gets a listing page. Folders `private/` and `templates/` are not published.

The home page (factions, timeline, books, game, gallery, hero art) is curated in `src/lib/universe.ts`; UI strings in all three languages are in `src/lib/site.ts`.

## Social previews, SEO and AI

- Every page gets a 1200×630 preview card at `/og/<path>.jpg` (X, Telegram, Facebook…), rendered by `src/lib/og.ts`.
- Open Graph / Twitter tags, `hreflang` between translations, JSON-LD, `sitemap.xml`, RSS at `/index.xml`.
- `/llms.txt` and `/llms-full.txt` for AI assistants, and a Markdown copy of every page (`<page>.md`). `public/robots.txt` allows AI crawlers.

## Layout

```
content/                   Obsidian vault (the only thing you edit to publish)
src/lib/obsidian.ts        Obsidian → Markdown conversion (links, embeds, languages, translations)
src/loaders/vault.ts       Astro content loader over content/
src/integrations/          serve/copy vault media under /media/, WebP thumbnails
src/lib/universe.ts        curated home page structure
src/components/            Home, Article, Reader (books), FolderPage, Search, cards
src/pages/                 routes for uk (root), en/, de/, tags, og cards, llms.txt, RSS, sitemap
public/                    favicon, CNAME, robots.txt
scripts/                   content maintenance scripts (i18n, images)
epubObsidianConverter/     builds EPUBs from the book notes
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages (custom domain `scifi.locadeserta.com`).
