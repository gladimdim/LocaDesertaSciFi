import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { i18n } from "../i18n"
import { joinSegments } from "../util/path"

export default (() => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const base = cfg.baseUrl ?? ""
    const rssUrl = `https://${joinSegments(base, "index.xml")}`
    return (
      <footer class={`${displayClass ?? ""}`}>
        <p class="footer-rss">
          <a href={rssUrl} aria-label="RSS Feed" title="Підписатися на RSS">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              x="0px"
              y="0px"
              viewBox="0 0 24 24"
              style="enable-background:new 0 0 24 24"
              xmlSpace="preserve"
              class="rss-icon"
            >
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
            </svg>
            {" "}
            {i18n(cfg.locale).components.footer.rssSubscribe ?? "RSS"}
          </a>
        </p>
        <p>All rights reserved © Dmytro Gladkyi</p>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
