import styles from "./styles/languageSwitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const labels: Record<string, string> = {
  uk: "Українська",
  en: "English",
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

  return (
    <nav class={classNames(displayClass, "language-switcher")} aria-label="Language">
      <span class="language-switcher-current">{labels[currentLang] ?? currentLang}</span>
      {Object.entries(translations).map(([lang, href]) => (
        <a href={href} hreflang={lang} lang={lang}>
          {labels[lang] ?? lang}
        </a>
      ))}
    </nav>
  )
}

LanguageSwitcher.css = styles

export default (() => LanguageSwitcher) satisfies QuartzComponentConstructor
