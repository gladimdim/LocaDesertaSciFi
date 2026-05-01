import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const contentDir = path.join(root, "content")
const enDir = path.join(contentDir, "en")

const dirNames = new Map(
  Object.entries({
    universe: "Universe",
    empires: "Empires",
    "corporate-republic": "Corporate Republic",
    "sun-empire": "Empire of the Sun",
    "hetmanate-federation": "Hetmanate Federation",
    "military-affairs": "Military Affairs",
    miscellany: "Miscellany",
    "star-affairs": "Star Affairs",
    ships: "Ships",
    history: "History",
    "europa-jovian": "Jovian Europa",
    technologies: "Technologies",
    warp: "Warp",
  }),
)

const slugUrl = (contentRelPath) => {
  if (contentRelPath === "index.md") return "/"
  let slug = contentRelPath
    .replace(/\.md$/, "")
    .replace(/\s/g, "-")
    .replace(/\/index$/, "")
  if (slug === "en/index") slug = "en"
  return `/${slug}`
}

const walk = (dir) => {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    return fullPath
  })
}

const parseFrontmatter = (text) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { frontmatter: "", body: text, values: new Map() }

  const values = new Map()
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*"?([^"]*)"?\s*$/)
    if (field) values.set(field[1], field[2])
  }

  return {
    frontmatter: match[0],
    body: text.slice(match[0].length),
    values,
  }
}

const toPosix = (p) => p.split(path.sep).join(path.posix.sep)
const withoutMd = (p) => p.replace(/\.md$/, "")
const normalizeNoExt = (p) => withoutMd(path.posix.normalize(p))
const relativeLink = (fromNoExt, toNoExt) => {
  const fromDir = path.posix.dirname(fromNoExt)
  const rel = path.posix.relative(fromDir, toNoExt)
  return rel === "" ? path.posix.basename(toNoExt) : rel
}

const contentBasenames = new Map()
for (const file of walk(contentDir)) {
  const name = path.basename(file)
  if (!contentBasenames.has(name)) contentBasenames.set(name, [])
  contentBasenames.get(name).push(file)
}

const englishFiles = walk(enDir).filter((file) => file.endsWith(".md"))
const oldToNew = new Map()

for (const oldAbs of englishFiles) {
  const oldRel = toPosix(path.relative(enDir, oldAbs))
  const { values } = parseFrontmatter(fs.readFileSync(oldAbs, "utf8"))
  const title = values.get("title")

  if (oldRel === "index.md" || !title) {
    oldToNew.set(oldRel, oldRel)
    continue
  }

  const parts = oldRel.split("/")
  const newDirs = parts.slice(0, -1).map((part) => dirNames.get(part) ?? part)
  oldToNew.set(oldRel, path.posix.join(...newDirs, `${title}.md`))
}

const oldNoExtToNewNoExt = new Map(
  Array.from(oldToNew.entries()).map(([oldRel, newRel]) => [
    withoutMd(oldRel).toLowerCase(),
    withoutMd(newRel),
  ]),
)

const resolveMarkdownAsset = (oldRel, target) => {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) return target

  const [pathname, suffix = ""] = target.split(/(?=[?#])/, 2)
  if (pathname === "") return target

  const oldDirAbs = path.dirname(path.join(enDir, oldRel))
  let targetAbs = path.resolve(oldDirAbs, pathname)

  if (!fs.existsSync(targetAbs)) {
    const normalized = pathname.replaceAll("\\", "/")
    const contentMarker = normalized.match(/(?:^|\/)(Books|Images|Всесвіт)\/.+$/)
    if (contentMarker) {
      targetAbs = path.join(contentDir, contentMarker[0].replace(/^\//, ""))
    }
  }

  if (!fs.existsSync(targetAbs)) {
    const matches = contentBasenames.get(path.basename(pathname)) ?? []
    if (matches.length === 1) targetAbs = matches[0]
  }

  if (!fs.existsSync(targetAbs)) return target

  const newRel = oldToNew.get(oldRel) ?? oldRel
  const newDirAbs = path.dirname(path.join(enDir, newRel))
  return `${toPosix(path.relative(newDirAbs, targetAbs))}${suffix}`
}

for (const [oldRel, newRel] of oldToNew) {
  const oldAbs = path.join(enDir, oldRel)
  if (!fs.existsSync(oldAbs)) continue

  let text = fs.readFileSync(oldAbs, "utf8")
  const oldNoExt = withoutMd(oldRel)
  const newNoExt = withoutMd(newRel)

  text = text.replace(
    /\[\[([^\]|#]+)(#[^\]|]+)?(\|[^\]]+)?\]\]/g,
    (match, target, anchor = "", alias = "") => {
      const targetNoExt = normalizeNoExt(path.posix.join(path.posix.dirname(oldNoExt), target))
      const mapped = oldNoExtToNewNoExt.get(targetNoExt.toLowerCase())
      if (!mapped) return match

      return `[[${relativeLink(newNoExt, mapped)}${anchor}${alias}]]`
    },
  )

  text = text.replace(/(!?\[[^\]]*\]\()([^)\n]+)(\))/g, (match, start, target, end) => {
    return `${start}${resolveMarkdownAsset(oldRel, target)}${end}`
  })

  const newAbs = path.join(enDir, newRel)
  fs.mkdirSync(path.dirname(newAbs), { recursive: true })
  fs.writeFileSync(newAbs, text)
}

for (const [oldRel, newRel] of oldToNew) {
  if (oldRel === newRel) continue
  const oldAbs = path.join(enDir, oldRel)
  const newAbs = path.join(enDir, newRel)
  if (oldAbs.toLowerCase() === newAbs.toLowerCase()) continue
  if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs)
}

const cleanupEmptyDirs = (dir) => {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) cleanupEmptyDirs(path.join(dir, entry.name))
  }

  if (dir !== enDir && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir)
  }
}

const renameDirCase = (parentRel, fromName, toName) => {
  const parentAbs = path.join(enDir, parentRel)
  const fromAbs = path.join(parentAbs, fromName)
  const toAbs = path.join(parentAbs, toName)
  if (!fs.existsSync(fromAbs) || fromAbs === toAbs) return

  const tmpAbs = path.join(
    parentAbs,
    `.__case-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  )
  fs.renameSync(fromAbs, tmpAbs)
  fs.renameSync(tmpAbs, toAbs)
}

const renameFileCase = (parentRel, fromName, toName) => {
  const parentAbs = path.join(enDir, parentRel)
  const fromAbs = path.join(parentAbs, fromName)
  const toAbs = path.join(parentAbs, toName)
  if (!fs.existsSync(fromAbs) || fromAbs === toAbs) return

  const tmpAbs = path.join(
    parentAbs,
    `.__case-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  )
  fs.renameSync(fromAbs, tmpAbs)
  fs.renameSync(tmpAbs, toAbs)
}

cleanupEmptyDirs(enDir)

for (const [parentRel, fromName, toName] of [
  ["", "universe", "Universe"],
  ["Universe", "empires", "Empires"],
  ["Universe", "history", "History"],
  ["Universe", "technologies", "Technologies"],
  ["Universe/Technologies", "warp", "Warp"],
]) {
  renameDirCase(parentRel, fromName, toName)
}

renameFileCase("Universe/Technologies/Warp", "warp.md", "Warp.md")
cleanupEmptyDirs(enDir)

const urlByTranslationKey = new Map()
for (const newRel of oldToNew.values()) {
  const abs = path.join(enDir, newRel)
  if (!fs.existsSync(abs)) continue

  const { values } = parseFrontmatter(fs.readFileSync(abs, "utf8"))
  const key = values.get("translationKey")
  if (key) urlByTranslationKey.set(key, slugUrl(`en/${newRel}`))
}

for (const file of walk(contentDir).filter(
  (file) => file.endsWith(".md") && !file.startsWith(enDir),
)) {
  let text = fs.readFileSync(file, "utf8")
  const { values } = parseFrontmatter(text)
  const key = values.get("translationKey")
  const nextUrl = key ? urlByTranslationKey.get(key) : undefined
  if (!nextUrl) continue

  text = text.replace(
    /(\ntranslations:\n(?:[^\n]*\n)*?\s+en:\s*)("[^"]*"|[^\n]+)/,
    `$1"${nextUrl}"`,
  )
  fs.writeFileSync(file, text)
}

console.log(`Localized ${oldToNew.size} English markdown file paths.`)
