import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const contentDir = path.join(root, "content")
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"])

const toPosix = (p) => p.split(path.sep).join(path.posix.sep)
const walk = (dir) => {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    return fullPath
  })
}

const classifyImage = (relativePath) => {
  const name = path.basename(relativePath)

  if (relativePath.startsWith("Books/Вістря Кулаку/Images/")) {
    return `Images/Books/Vistria-Kulaku/${name}`
  }

  if (relativePath.startsWith("Books/Зоряний Гетьманат/Нотатки/Images/")) {
    return `Images/Books/Zorianyi-Hetmanat/Notes/${name}`
  }

  if (relativePath.startsWith("Books/Зоряний Гетьманат/Images/")) {
    return `Images/Books/Zorianyi-Hetmanat/${name}`
  }

  if (
    relativePath.startsWith("Всесвіт/Імперії/Федерація Гетьманату/Images/") ||
    relativePath.startsWith("Всесвіт/Імперії/Федерація Гетьманату/Історія/") ||
    relativePath.startsWith("en/Universe/Empires/Hetmanate Federation/Images/")
  ) {
    return `Images/Universe/Hetmanate-Federation/${name}`
  }

  if (relativePath.startsWith("Images/")) {
    if (name.startsWith("Hetmanat_") || name === "Cossack_Plastun.png") {
      return `Images/Universe/Hetmanate-Federation/${name}`
    }

    return relativePath
  }

  return `Images/Misc/${name}`
}

const imageFiles = walk(contentDir).filter((file) =>
  imageExtensions.has(path.extname(file).toLowerCase()),
)
const moveMap = new Map()
const basenameToDest = new Map()

for (const sourceAbs of imageFiles) {
  const sourceRel = toPosix(path.relative(contentDir, sourceAbs))
  const destRel = classifyImage(sourceRel)
  const destAbs = path.join(contentDir, destRel)
  moveMap.set(sourceAbs, destAbs)

  const basename = path.basename(sourceAbs)
  if (!basenameToDest.has(basename)) basenameToDest.set(basename, new Set())
  basenameToDest.get(basename).add(destAbs)

  if (sourceAbs !== destAbs) {
    fs.mkdirSync(path.dirname(destAbs), { recursive: true })
    if (!fs.existsSync(destAbs)) {
      fs.copyFileSync(sourceAbs, destAbs)
    }
  }
}

const resolveImageTarget = (markdownAbs, target) => {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) return undefined

  const pathname = target.split(/[?#]/, 1)[0]
  if (pathname === "") return undefined

  const directAbs = path.resolve(path.dirname(markdownAbs), pathname)
  if (moveMap.has(directAbs)) return moveMap.get(directAbs)

  const candidates = basenameToDest.get(path.basename(pathname))
  if (candidates?.size === 1) return Array.from(candidates)[0]

  return undefined
}

for (const markdownAbs of walk(contentDir).filter((file) => file.endsWith(".md"))) {
  let text = fs.readFileSync(markdownAbs, "utf8")
  const next = text.replace(/(!\[[^\]]*\]\()([^)\n]+)(\))/g, (match, start, target, end) => {
    const destAbs = resolveImageTarget(markdownAbs, target)
    if (!destAbs) return match

    const suffix = target.match(/[?#].*$/)?.[0] ?? ""
    const rel = toPosix(path.relative(path.dirname(markdownAbs), destAbs))
    return `${start}${rel}${suffix}${end}`
  })

  if (next !== text) fs.writeFileSync(markdownAbs, next)
}

for (const [sourceAbs, destAbs] of moveMap) {
  if (sourceAbs !== destAbs && fs.existsSync(sourceAbs)) {
    fs.unlinkSync(sourceAbs)
  }
}

const cleanupEmptyDirs = (dir) => {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) cleanupEmptyDirs(path.join(dir, entry.name))
  }

  if (dir !== contentDir && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir)
  }
}

cleanupEmptyDirs(contentDir)

console.log(`Consolidated ${imageFiles.length} image files into content/Images/**.`)
