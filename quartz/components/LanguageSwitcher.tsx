import styles from "./styles/languageSwitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { joinSegments, pathToRoot } from "../util/path"

const labels: Record<string, string> = {
  uk: "🇺🇦",
  en: "🇬🇧",
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

  return (
    <nav class={classNames(displayClass, "language-switcher")} aria-label="Language">
      <span class="language-switcher-current">{labels[currentLang] ?? currentLang}</span>
      {Object.entries(translations).map(([lang, href]) => {
        const resolvedHref = href.startsWith("/") ? joinSegments(baseDir, href.slice(1)) : href
        return (
          <a href={resolvedHref} hreflang={lang} lang={lang}>
            {labels[lang] ?? lang}
          </a>
        )
      })}
    </nav>
  )
}

LanguageSwitcher.css = styles

export default (() => LanguageSwitcher) satisfies QuartzComponentConstructor
