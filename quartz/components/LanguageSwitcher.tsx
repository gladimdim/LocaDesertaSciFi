import styles from "./styles/languageSwitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { joinSegments, pathToRoot } from "../util/path"

const flags: Record<string, string> = {
  uk: "🇺🇦",
  en: "🇬🇧",
  de: "🇩🇪",
}

const LanguageSwitcher: QuartzComponent = ({
  displayClass,
  fileData,
  cfg,
}: QuartzComponentProps) => {
  const currentLang = String(fileData.frontmatter?.lang ?? cfg.locale.split("-")[0] ?? "uk")
  const translations = fileData.frontmatter?.translations as Record<string, string> | undefined

  if (!translations || Object.keys(translations).length === 0) {
    return null
  }

  const baseDir = pathToRoot(fileData.slug!)

  const options = [
    { lang: currentLang, href: "", display: flags[currentLang] ?? currentLang },
    ...Object.entries(translations).map(([lang, href]) => ({
      lang,
      href: href.startsWith("/") ? joinSegments(baseDir, href.slice(1)) : href,
      display: flags[lang] ?? lang,
    })),
  ]

  return (
    <div class={classNames(displayClass, "language-switcher")}>
      <select
        class="language-select"
        aria-label="Language"
        onChange={(e) => {
          const url = (e.target as HTMLSelectElement).value
          if (url) window.location.href = url
        }}
      >
        {options.map((opt) => (
          <option value={opt.href} selected={opt.lang === currentLang}>
            {opt.display}
          </option>
        ))}
      </select>
    </div>
  )
}

LanguageSwitcher.css = styles

export default (() => LanguageSwitcher) satisfies QuartzComponentConstructor
