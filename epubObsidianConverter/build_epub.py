#!/usr/bin/env python3
"""
Convert Obsidian markdown books to EPUB.
Usage:  python3 build_epub.py [path/to/book_config.json]

If no argument given, looks for book_config.json in the script's directory.
See book_config.template.json for the required fields.
"""

import re
import os
import sys
import json
import uuid
from collections import OrderedDict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
VENV = os.path.join(PROJECT_ROOT, ".venv", "lib", "python3.9", "site-packages")
if VENV not in sys.path:
    sys.path.insert(0, VENV)

from ebooklib import epub

os.chdir(PROJECT_ROOT)


# ── Config loader ───────────────────────────────────────────────

def load_config(path=None):
    """Load book metadata from a JSON config file. Returns a dict."""
    if path is None:
        # Default: look for book_config.json next to this script
        path = os.path.join(SCRIPT_DIR, "book_config.json")
    if not os.path.isfile(path):
        print(f"ERROR: config file not found: {path}")
        print("Copy book_config.template.json and fill in your book's details.")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    # Resolve relative paths to absolute (relative to PROJECT_ROOT)
    for key in ("book_file", "output_epub", "content_root"):
        if key in cfg and cfg[key] is not None:
            cfg[key] = os.path.join(PROJECT_ROOT, cfg[key])
    if "sample" in cfg and cfg["sample"]:
        if "output" in cfg["sample"] and cfg["sample"]["output"]:
            cfg["sample"]["output"] = os.path.join(PROJECT_ROOT, cfg["sample"]["output"])
    # Defaults
    cfg.setdefault("content_root", os.path.join(PROJECT_ROOT, "content"))
    cfg.setdefault("language", "uk")
    cfg.setdefault("cover_image", None)
    cfg.setdefault("series", None)
    cfg.setdefault("series_index", None)
    return cfg


# ── Load config (first CLI arg, or default) ─────────────────────

cfg = load_config(sys.argv[1] if len(sys.argv) > 1 else None)

# Shortcuts for convenience
BOOK_FILE    = cfg["book_file"]
BOOK_TITLE   = cfg["title"]
BOOK_AUTHOR  = cfg["author"]
OUTPUT_EPUB  = cfg["output_epub"]
CONTENT_ROOT = cfg["content_root"]

BOOK_LANG        = cfg["language"]
BOOK_DESCRIPTION = cfg.get("description", "")
BOOK_PUBLISHER   = cfg.get("publisher", "")
BOOK_SUBJECTS    = cfg.get("subjects", [])
BOOK_RIGHTS      = cfg.get("rights", "")
BOOK_DATE        = cfg.get("date", "")
BOOK_SERIES      = cfg.get("series")
BOOK_SERIES_INDEX = cfg.get("series_index")

COVER_IMAGE = cfg.get("cover_image")

SAMPLE_EPUB  = cfg.get("sample", {}).get("enabled", False)
SAMPLE_TITLE = cfg.get("sample", {}).get("title", f"{BOOK_TITLE} — Уривок")
SAMPLE_OUTPUT = cfg.get("sample", {}).get("output", os.path.join(PROJECT_ROOT, f"output/{BOOK_TITLE}_Sample.epub"))
SAMPLE_CUTOFF = cfg.get("sample", {}).get("cutoff_text", "")

# ============================================================
# STEP 0: Find cover image
# ============================================================

def find_cover(book_dir, explicit_path):
    """Find the cover image. Returns absolute path or None.
    Looks for Cover.jpg / Cover.jpeg / Cover.png in the book's directory
    (same folder as the main .md file). Case-insensitive."""
    if explicit_path and os.path.isfile(explicit_path):
        print(f"Cover: {explicit_path}")
        return explicit_path
    
    # Auto-detect: Cover.{jpg,jpeg,png} in book_dir (not Images/ subfolder)
    for name in os.listdir(book_dir):
        if name.lower() in ('cover.jpg', 'cover.jpeg', 'cover.png'):
            path = os.path.join(book_dir, name)
            print(f"Cover (auto): {path}")
            return path
    
    print("Cover: not found")
    return None


def resize_cover_to_1400(cover_path):
    """Resize cover so both width and height are >= 1400px (Apple Books requirement).
    Keeps aspect ratio. Overwrites the file in place."""
    try:
        from PIL import Image
    except ImportError:
        print("  Pillow not installed — skipping cover resize")
        return
    
    img = Image.open(cover_path)
    w, h = img.size
    if w >= 1400 and h >= 1400:
        return  # already big enough
    
    # Scale so the smaller axis reaches 1400
    scale = 1400 / min(w, h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    img_resized = img.resize((new_w, new_h), Image.LANCZOS)
    img_resized.save(cover_path, quality=92)
    print(f"  Cover resized: {w}x{h} → {new_w}x{new_h}")

# ============================================================
# STEP 1: Extract frontmatter from articles for glossary
# ============================================================

def extract_summary(md_path):
    """Read a .md file and extract the first meaningful paragraph (after frontmatter, after # heading)."""
    if not os.path.isfile(md_path):
        return None
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Skip frontmatter
    if content.startswith("---"):
        end = content.find("---", 3)
        if end != -1:
            content = content[end+3:]
    
    # Remove images
    content = re.sub(r'!\[.*?\]\(.*?\)', '', content)
    content = re.sub(r'!\[\[.*?\]\]', '', content)
    
    # Remove headings
    content = re.sub(r'^#+\s+.*$', '', content, flags=re.MULTILINE)
    
    # Remove wiki-links (keep display text)
    content = re.sub(r'\[\[([^\]|]+)\|([^\]]+)\]\]', r'\2', content)
    content = re.sub(r'\[\[([^\]]+)\]\]', r'\1', content)
    
    # Remove markdown formatting
    content = re.sub(r'\*\*(.+?)\*\*', r'\1', content)
    content = re.sub(r'\*(.+?)\*', r'\1', content)
    
    # Find first non-empty paragraph
    paras = [p.strip() for p in content.split("\n\n") if p.strip()]
    for p in paras:
        # Clean up newlines within paragraph
        p = re.sub(r'\n+', ' ', p).strip()
        if len(p) > 50:  # Meaningful paragraph
            # Truncate to reasonable size
            if len(p) > 500:
                p = p[:500].rsplit('.', 1)[0] + '.'
            return p
    
    return None

# ============================================================
# STEP 2: Resolve wiki links
# ============================================================

def resolve_wikilink(link, current_file):
    parts = link.split("|")
    target = parts[0]
    display = parts[1] if len(parts) > 1 else target.split("/")[-1]
    
    current_dir = os.path.dirname(current_file)
    
    if target.startswith("../") or target.startswith("./"):
        resolved = os.path.normpath(os.path.join(current_dir, target))
    else:
        # Try relative to book directory first, then relative to content root
        resolved = os.path.normpath(os.path.join(current_dir, target))
        if not os.path.isfile(resolved + ".md") and not os.path.isfile(resolved):
            resolved = os.path.normpath(os.path.join(CONTENT_ROOT, target))
    
    for ext in [".md", ""]:
        candidate = resolved + ext if ext else resolved
        if os.path.isfile(candidate):
            return candidate, display
    
    return None, display

# ============================================================
# STEP 3: Process the book
# ============================================================

def find_images_in_markdown(content, book_dir):
    """Find all image references and replace with embedded base64."""
    images = {}
    
    def replace_md_image(match):
        alt = match.group(1)
        path = match.group(2)
        # Remove size specifier like |609
        if '|' in alt:
            alt = alt.split('|')[0]
        
        # Resolve path
        if path.startswith("./"):
            img_path = os.path.normpath(os.path.join(book_dir, path))
        elif path.startswith("../"):
            img_path = os.path.normpath(os.path.join(book_dir, path))
        else:
            img_path = path
        
        if not os.path.isfile(img_path):
            # Try public/Images — strip leading ../ from path and go to project root
            clean_path = re.sub(r'^(\.\./)+', '', path)
            # book_dir is content/Books/Вістря Кулаку, need ../../../public/ to reach project-root/public/
            alt_path = os.path.normpath(os.path.join(book_dir, "..", "..", "..", "public", clean_path))
            if os.path.isfile(alt_path):
                img_path = alt_path
        
        if os.path.isfile(img_path):
            img_id = f"img_{len(images)}"
            images[img_id] = img_path
            return f'![{alt}]({img_id})'
        else:
            print(f"  WARNING: Image not found: {img_path}")
            return match.group(0)
    
    def replace_wiki_image(match):
        inner = match.group(1)
        parts = inner.split('|')
        path = parts[0]
        # Resolve: these are usually ../../../../Images/... paths
        # They point relative to the book file; actual images are in public/Images/
        img_path = os.path.normpath(os.path.join(book_dir, path))
        if not os.path.isfile(img_path):
            # Try public/Images — strip leading ../ from path
            clean_path = re.sub(r'^(\.\./)+', '', path)
            alt_path = os.path.normpath(os.path.join(book_dir, "..", "..", "..", "public", clean_path))
            if os.path.isfile(alt_path):
                img_path = alt_path
        if os.path.isfile(img_path):
            img_id = f"img_{len(images)}"
            images[img_id] = img_path
            return f'![image]({img_id})'
        else:
            print(f"  WARNING: Wiki-image not found: {img_path}")
            return match.group(0)
    
    # Replace ![[image.png]] style
    content = re.sub(r'!\[\[([^\]]+)\]\]', replace_wiki_image, content)
    # Replace ![alt](path) style
    content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_md_image, content)
    
    return content, images

def process_book():
    book_dir = os.path.dirname(BOOK_FILE)
    
    # Find cover first
    cover_path = find_cover(book_dir, COVER_IMAGE)
    if cover_path:
        resize_cover_to_1400(cover_path)
    
    with open(BOOK_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find and process images
    content, images = find_images_in_markdown(content, book_dir)
    print(f"Found {len(images)} images")
    
    # Find all wiki-links and build glossary
    wiki_links = re.findall(r'\[\[([^\]]+)\]\]', content)
    
    # Build ordered glossary (preserve order of first appearance)
    glossary = OrderedDict()
    link_counter = 0
    
    for link in wiki_links:
        path, display = resolve_wikilink(link, BOOK_FILE)
        if path and path not in glossary:
            summary = extract_summary(path)
            if summary:
                glossary[path] = {
                    'display': display,
                    'summary': summary,
                    'id': link_counter
                }
                link_counter += 1
    
    print(f"Glossary entries: {len(glossary)}")
    
    # Now replace wiki-links in content with superscript references
    # We need to map each original [[link]] to its glossary id
    # But since the same article might be linked multiple times, 
    # we give each article a single glossary number
    
    # Build a map from resolved path to glossary number
    path_to_num = {}
    num = 1
    for path in glossary:
        path_to_num[path] = num
        num += 1
    
    def replace_wikilink(match):
        link = match.group(1)
        parts = link.split("|")
        display = parts[1] if len(parts) > 1 else parts[0].split("/")[-1]
        path, _ = resolve_wikilink(link, BOOK_FILE)
        if path and path in path_to_num:
            return f'{display}[[{path_to_num[path]}]]'
        else:
            return display
    
    content = re.sub(r'\[\[([^\]]+)\]\]', replace_wikilink, content)
    
    # Remove remaining [[n]] markers for glossary references (we'll handle these differently)
    # Actually let me rethink. I'll convert to HTML first, then handle glossary refs.
    
    return content, images, glossary, path_to_num, cover_path

# ============================================================
# STEP 4: Split into chapters and convert to HTML
# ============================================================

def split_into_chapters(content):
    """Split markdown content by # headings into chapters.
    Returns list of (title, level, body_md) tuples.
    level=1 for #, level=2 for ##."""
    lines = content.split('\n')
    chapters = []
    current_title = None
    current_level = 1
    current_lines = []
    
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('# '):
            # Save previous chapter
            if current_title is not None or current_lines:
                chapters.append((current_title or BOOK_TITLE, current_level, '\n'.join(current_lines)))
            current_title = stripped.lstrip('#').strip()
            current_level = 1
            current_lines = []
        elif stripped.startswith('## '):
            # Sub-chapter: save previous, start new
            if current_title is not None or current_lines:
                chapters.append((current_title or BOOK_TITLE, current_level, '\n'.join(current_lines)))
            current_title = stripped.lstrip('#').strip()
            current_level = 2
            current_lines = []
        else:
            current_lines.append(line)
    
    # Save last chapter
    if current_title is not None or current_lines:
        chapters.append((current_title or BOOK_TITLE, current_level, '\n'.join(current_lines)))
    
    return chapters

def md_to_html(body_md):
    """Convert a single chapter's markdown body to HTML."""
    lines = body_md.split('\n')
    html_parts = []
    in_para = False
    para_lines = []
    
    def flush_para():
        nonlocal in_para, para_lines
        if para_lines:
            text = ' '.join(para_lines)
            html_parts.append(f'<p>{process_inline(text)}</p>')
            para_lines = []
        in_para = False
    
    def process_inline(text):
        text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
        text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
        text = re.sub(r'(\S+)\[\[(\d+)\]\]', 
                      r'\1<sup><a href="glossary.xhtml#glossary-\2" class="glossary-ref">\2</a></sup>', 
                      text)
        text = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'<img src="\2" alt="\1" class="book-img"/>', text)
        return text
    
    for line in lines:
        stripped = line.strip()
        
        if stripped.startswith('#'):
            flush_para()
            level = len(stripped) - len(stripped.lstrip('#'))
            heading_text = stripped.lstrip('#').strip()
            heading_text = process_inline(heading_text)
            html_parts.append(f'<h{level}>{heading_text}</h{level}>')
            continue
        
        if not stripped:
            flush_para()
            continue
        
        if not in_para:
            in_para = True
        para_lines.append(stripped)
    
    flush_para()
    return '\n'.join(html_parts)

# ============================================================
# STEP 5: Build EPUB
# ============================================================

def build_epub(chapters, images, glossary, path_to_num, cover_path):
    """Build the EPUB file with proper chapter splitting and TOC."""
    os.makedirs("output", exist_ok=True)
    
    book = epub.EpubBook()
    book.set_identifier(str(uuid.uuid4()))
    book.set_title(BOOK_TITLE)
    book.set_language(BOOK_LANG)
    book.add_author(BOOK_AUTHOR)
    
    # Extended metadata
    book.add_metadata('DC', 'description', BOOK_DESCRIPTION)
    book.add_metadata('DC', 'publisher', BOOK_PUBLISHER)
    book.add_metadata('DC', 'rights', BOOK_RIGHTS)
    book.add_metadata('DC', 'date', BOOK_DATE)
    for subject in BOOK_SUBJECTS:
        book.add_metadata('DC', 'subject', subject)
    
    # Series (Calibre-compatible)
    if BOOK_SERIES:
        book.add_metadata(None, 'meta', '', {'name': 'calibre:series', 'content': BOOK_SERIES})
    if BOOK_SERIES_INDEX is not None:
        book.add_metadata(None, 'meta', '', {'name': 'calibre:series_index', 'content': str(BOOK_SERIES_INDEX)})
    
    # Set cover
    if cover_path and os.path.isfile(cover_path):
        with open(cover_path, 'rb') as cf:
            cover_data = cf.read()
        ext = os.path.splitext(cover_path)[1].lower()
        cover_mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}.get(ext, 'image/png')
        book.set_cover(f"cover{ext}", cover_data, create_page=True)
        print(f"Cover embedded ({len(cover_data)} bytes)")
    
    # CSS
    style = '''
    body { font-family: "Georgia", "Times New Roman", serif; line-height: 1.6; margin: 2em; }
    h1, h2, h3 { text-align: left; margin-top: 1.5em; }
    p { text-indent: 1.5em; margin: 0.5em 0; }
    p:first-of-type { text-indent: 0; }
    img.book-img { max-width: 100%; height: auto; display: block; margin: 1em auto; }
    sup a.glossary-ref { 
        text-decoration: none; 
        color: #8B0000; 
        font-size: 0.75em; 
        font-weight: bold;
    }
    .glossary-entry { margin: 0.5em 0 1em 1em; }
    .glossary-term { font-weight: bold; }
    hr { margin: 2em 0; border: none; border-top: 1px solid #ccc; }
    '''
    
    css = epub.EpubItem(uid="style", file_name="style/default.css", media_type="text/css", content=style.encode('utf-8'))
    book.add_item(css)
    
    # Add images
    image_items = {}
    for img_id, img_path in images.items():
        if os.path.isfile(img_path):
            with open(img_path, 'rb') as f:
                img_data = f.read()
            ext = os.path.splitext(img_path)[1].lower()
            media_type = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
            }.get(ext, 'image/jpeg')
            
            img_item = epub.EpubItem(
                uid=img_id,
                file_name=f'images/{img_id}{ext}',
                media_type=media_type,
                content=img_data
            )
            book.add_item(img_item)
            image_items[img_id] = img_item
    
    # Resolve image src paths
    def resolve_images(html):
        for img_id, img_item in image_items.items():
            ext = os.path.splitext(images[img_id])[1]
            html = html.replace(f'src="{img_id}"', f'src="images/{img_id}{ext}"')
        return html
    
    # Add back-reference anchors to glossary refs
    ref_counter = {}
    def add_backrefs(html):
        nonlocal ref_counter
        def repl(match):
            word = match.group(1)
            num = match.group(2)
            if num not in ref_counter:
                ref_counter[num] = 0
            ref_counter[num] += 1
            idx = ref_counter[num]
            return f'{word}<sup><a href="glossary.xhtml#glossary-{num}" class="glossary-ref" id="glossary-ref-{num}-{idx}">{num}</a></sup>'
        return re.sub(
            r'(\S+)<sup><a href="glossary\.xhtml#glossary-(\d+)" class="glossary-ref">(\d+)</a></sup>',
            repl,
            html
        )
    
    def html_page(title, body):
        return f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="uk" lang="uk">
<head><title>{title}</title>
<link rel="stylesheet" type="text/css" href="style/default.css"/>
</head>
<body>
<h1>{title}</h1>
{body}
</body>
</html>'''
    
    # Build glossary chapter
    glossary_html = '<h2>Глосарій</h2>\n<hr/>\n'
    for path, info in glossary.items():
        num = path_to_num[path]
        article_title = os.path.splitext(os.path.basename(path))[0]
        glossary_html += f'<div class="glossary-entry" id="glossary-{num}">'
        glossary_html += f'<p class="glossary-term">{num}. {article_title}</p>'
        glossary_html += f'<p>{info["summary"]}</p>'
        glossary_html += '</div>\n'
    
    glossary_full = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="uk" lang="uk">
<head><title>Глосарій</title>
<link rel="stylesheet" type="text/css" href="style/default.css"/>
</head>
<body>
{glossary_html}
</body>
</html>'''
    
    glossary_chapter = epub.EpubHtml(
        title='Глосарій',
        file_name='glossary.xhtml',
        lang='uk'
    )
    glossary_chapter.content = glossary_full.encode('utf-8')
    glossary_chapter.add_item(css)
    book.add_item(glossary_chapter)
    
    # Build chapter pages
    epub_chapters = []
    toc_entries = []
    
    for i, (title, level, body_md) in enumerate(chapters):
        body_html = md_to_html(body_md)
        body_html = resolve_images(body_html)
        body_html = add_backrefs(body_html)
        
        file_name = f'ch{i:02d}.xhtml'
        full_html = html_page(title, body_html)
        
        ch = epub.EpubHtml(
            title=title,
            file_name=file_name,
            lang='uk'
        )
        ch.content = full_html.encode('utf-8')
        ch.add_item(css)
        for img_item in image_items.values():
            ch.add_item(img_item)
        
        book.add_item(ch)
        epub_chapters.append(ch)
        toc_entries.append(epub.Link(file_name, title, f'ch{i}'))
    
    # Build TOC
    book.toc = toc_entries
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    
    # Spine: nav, then chapters, then glossary
    book.spine = ['nav'] + epub_chapters + [glossary_chapter]
    
    # Write
    epub.write_epub(OUTPUT_EPUB, book, {})
    print(f"\nEPUB written to: {OUTPUT_EPUB}")
    print(f"Chapters: {len(chapters)}")
    print(f"Glossary entries: {len(glossary)}")
    print(f"Images embedded: {len(image_items)}")


def build_sample(chapters, images, cover_path):
    """Build a free-sample EPUB from the last chapter only. No glossary."""
    if not chapters:
        print("No chapters to sample.")
        return
    
    last_title, last_level, last_body = chapters[-1]
    
    # Trim at cutoff point (if configured) — cutoff text is excluded from the sample
    if SAMPLE_CUTOFF and SAMPLE_CUTOFF in last_body:
        last_body = last_body[:last_body.index(SAMPLE_CUTOFF)]
    
    os.makedirs(os.path.dirname(SAMPLE_OUTPUT), exist_ok=True)
    
    book = epub.EpubBook()
    book.set_identifier(str(uuid.uuid4()))
    book.set_title(SAMPLE_TITLE)
    book.set_language('uk')
    book.add_author(BOOK_AUTHOR)
    book.add_metadata('DC', 'description', f'Уривок із роману «{BOOK_TITLE}». Фінальний штурм варп-станції.')
    book.add_metadata('DC', 'publisher', BOOK_PUBLISHER)
    book.add_metadata('DC', 'rights', BOOK_RIGHTS)
    
    if cover_path and os.path.isfile(cover_path):
        with open(cover_path, 'rb') as cf:
            book.set_cover(os.path.basename(cover_path), cf.read(), create_page=True)
    
    css = epub.EpubItem(uid='style', file_name='style/default.css', media_type='text/css', content='''
    body { font-family: Georgia, serif; line-height: 1.6; margin: 2em; }
    h1, h2 { text-align: left; margin: 1em 0 0.5em 0; }
    p { text-indent: 1.5em; margin: 0.5em 0; }
    p:first-of-type { text-indent: 0; }
    img.book-img { max-width: 100%; height: auto; display: block; margin: 1em auto; }
    '''.encode('utf-8'))
    book.add_item(css)
    
    # Embed images for this chapter
    img_items = {}
    for img_id, img_path in images.items():
        with open(img_path, 'rb') as f:
            img_data = f.read()
        ext = os.path.splitext(img_path)[1]
        img_item = epub.EpubItem(uid=img_id, file_name=f'images/{img_id}{ext}',
                                 media_type='image/jpeg', content=img_data)
        book.add_item(img_item)
        img_items[img_id] = img_item
    
    # Strip wiki-links and glossary markers entirely (no glossary in sample)
    body_clean = re.sub(r'\[\[([^\]]+)\]\]', '', last_body)
    body_html = md_to_html(body_clean)
    for img_id, img_item in img_items.items():
        ext = os.path.splitext(images[img_id])[1]
        body_html = body_html.replace(f'src="{img_id}"', f'src="images/{img_id}{ext}"')
    
    full_html = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="uk" lang="uk">
<head><title>{SAMPLE_TITLE}</title>
<link rel="stylesheet" type="text/css" href="style/default.css"/>
</head>
<body>
<h1>{BOOK_TITLE}</h1>
<p><em>Уривок із фінальної глави «{last_title}»</em></p>
<hr/>
{body_html}
<hr/>
<p style="text-align:center; font-style:italic;">Це безкоштовний уривок. Повну версію книги шукайте на сайті видавництва.</p>
</body>
</html>'''
    
    ch = epub.EpubHtml(title=SAMPLE_TITLE, file_name='sample.xhtml', lang='uk')
    ch.content = full_html.encode('utf-8')
    ch.add_item(css)
    for img in img_items.values():
        ch.add_item(img)
    book.add_item(ch)
    
    book.toc = [epub.Link('sample.xhtml', SAMPLE_TITLE, 'sample')]
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = ['nav', ch]
    
    epub.write_epub(SAMPLE_OUTPUT, book, {})
    print(f"\nSample EPUB written to: {SAMPLE_OUTPUT}")


def main():
    print("Processing book...")
    content, images, glossary, path_to_num, cover_path = process_book()
    
    print("Splitting into chapters...")
    chapters = split_into_chapters(content)
    
    if SAMPLE_EPUB:
        print("Building sample EPUB...")
        build_sample(chapters, images, cover_path)
    else:
        print("Building EPUB...")
        build_epub(chapters, images, glossary, path_to_num, cover_path)

if __name__ == "__main__":
    main()
