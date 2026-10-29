import { defineConfig } from "astro/config"
import { media } from "./src/integrations/media.ts"
import { thumbs } from "./src/integrations/thumbs.ts"

export default defineConfig({
  site: "https://scifi.locadeserta.com",
  trailingSlash: "ignore",
  scopedStyleStrategy: "class",
  devToolbar: { enabled: false },
  integrations: [media("./content"), thumbs("./content")],
  markdown: {
    shikiConfig: { theme: "tokyo-night" },
  },
})
