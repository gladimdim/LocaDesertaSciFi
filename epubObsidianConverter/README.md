# epubObsidianConverter

Converts an Obsidian markdown book into an EPUB file driven by a JSON metadata file.

- **Embedded images** — all local images are bundled directly into the EPUB
- **Cover image** — auto-detected or explicitly configured
- **Glossary with active cross-references** — every `[[wiki-link]]` to another Obsidian article is replaced with a superscript number (e.g. `Terminator¹`) that links to a glossary entry at the end of the book
- **Character notes** — links to character/note files within the book's folder are also included in the glossary
- **Sample EPUB** — optional free excerpt (last chapter, trimmed, no glossary)
- **Full metadata** — title, author, description, series, subjects, rights, publisher

## Quick Start

```bash
# 1. Copy and fill in the template
cp epubObsidianConverter/book_config.template.json epubObsidianConverter/book_config.json

# 2. Setup Python environment (once per machine)
./epubObsidianConverter/setup.sh setup

# 3. Build
./epubObsidianConverter/setup.sh build
```

To use a custom config path:

```bash
./epubObsidianConverter/setup.sh build path/to/my_book_config.json
```

## JSON Config Reference

See `book_config.template.json` for a fully annotated example.

| Field | Type | Description |
|---|---|---|
| `book_file` | string | Path to the main `.md` book file (relative to project root) |
| `output_epub` | string | Where to write the `.epub` (relative to project root) |
| `content_root` | string | Root of the Obsidian vault's `content/` directory |
| `title` | string | EPUB title |
| `author` | string | EPUB author |
| `language` | string | Language code (`uk`, `en`, etc.) |
| `description` | string | Book description / back-cover blurb |
| `publisher` | string | Publisher name |
| `subjects` | [string] | Genre tags |
| `rights` | string | Copyright notice |
| `date` | string | Publication year |
| `series` | string | Series name (`null` to omit) |
| `series_index` | int | Volume number in series (`null` to omit) |
| `cover_image` | string | Explicit cover path, or `null` for auto-detect |
| `sample.enabled` | bool | Set to `true` to also build a free-sample EPUB |
| `sample.output` | string | Path for the sample `.epub` |
| `sample.title` | string | Title for the sample EPUB |
| `sample.cutoff_text` | string | Trim the last chapter at this exact text (empty = full chapter) |

## Requirements

Python 3.9+. All dependencies go into `.venv` — run `setup.sh setup` once.
