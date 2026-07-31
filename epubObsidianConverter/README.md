# epubObsidianConverter

Converts an Obsidian markdown book into an EPUB file with:

- **Embedded images** — all local images are bundled directly into the EPUB
- **Cover image** — auto-detected or explicitly configured
- **Glossary with active cross-references** — every `[[wiki-link]]` to another Obsidian article is replaced with a superscript number (e.g. `Terminator¹`) that links to a glossary entry at the end of the book. Each glossary entry contains a short summary auto-extracted from the linked article.
- **Character notes** — links to character/note files within the book's folder are also included in the glossary.

## Requirements

Python 3.9+ (no system packages needed — everything goes into `.venv`).

## Usage

### First time (or on a new machine)

```bash
./epubObsidianConverter/setup.sh setup
```

### Build the EPUB

```bash
./epubObsidianConverter/setup.sh build
```

Or directly with an already-activated venv:

```bash
source .venv/bin/activate
python3 epubObsidianConverter/build_epub.py
```

### Configure for a different book

Edit `build_epub.py` and change the configuration block at the top:

```python
BOOK_FILE   = os.path.join(PROJECT_ROOT, "content/Books/Your Book/Your Book.md")
BOOK_TITLE  = "Your Book Title"
BOOK_AUTHOR = "Author Name"
OUTPUT_EPUB = os.path.join(PROJECT_ROOT, "output/Your_Book.epub")
```

### Cover image

Place a `Cover.jpg`, `Cover.jpeg`, or `Cover.png` file **in the same folder** as the book's main `.md` file. The script auto-detects it (case-insensitive).

To use a specific path instead:

```python
COVER_IMAGE = "/absolute/path/to/cover.png"
```

## How It Works

| Step | Description |
|---|---|
| 0. Cover | Finds the cover image (explicit path or auto-detect) |
| 1. Extract links | Finds all `[[path\|display]]` wiki-links in the book |
| 2. Resolve articles | Maps each link to a real `.md` file in `content/` |
| 3. Summarize | Reads the first meaningful paragraph from each linked article for the glossary |
| 4. Find images | Resolves all `![alt](path)` and `![[path]]` image references, looking in both `content/` and `public/Images/` |
| 5. Replace links | Converts `[[path\|display]]` → `display¹` (superscript with internal link) |
| 6. Build EPUB | Wraps everything into a valid EPUB with embedded images, cover, CSS, and navigation |

## Configuration reference

| Variable | Description |
|---|---|
| `BOOK_FILE` | Path to the main `.md` book file |
| `BOOK_TITLE` | EPUB title (shown in readers) |
| `BOOK_AUTHOR` | EPUB author metadata |
| `OUTPUT_EPUB` | Where to write the `.epub` file |
| `CONTENT_ROOT` | Root of the Obsidian vault's `content/` directory |
| `COVER_IMAGE` | Explicit cover path, or `None` for auto-detect |
| `BOOK_LANG` | Language code (`uk`, `en`, etc.) |
| `BOOK_DESCRIPTION` | Book description / blurb |
| `BOOK_PUBLISHER` | Publisher name |
| `BOOK_SUBJECTS` | List of genre tags (`["Sci-Fi", "Military SF", ...]`) |
| `BOOK_RIGHTS` | Copyright notice |
| `BOOK_DATE` | Publication date / year |
| `BOOK_SERIES` | Series name (Calibre-compatible, `None` to omit) |
| `BOOK_SERIES_INDEX` | Volume number in series (`None` to omit) |
| `SAMPLE_EPUB` | Set to `True` to build a free-sample EPUB (last chapter only) |
| `SAMPLE_TITLE` | Title for the sample EPUB |
| `SAMPLE_OUTPUT` | Path for the sample `.epub` file |

## Caveats

- The Python module `ebooklib` must be installed in the project's `.venv`
- Only `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` images are supported
- The script assumes wiki-links use relative paths (`../../Всесвіт/...`) from the book's location
