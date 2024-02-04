import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://wrapitmoving.com",
  integrations: [tailwind(), sitemap(), icon()],
  output: "server",
  adapter: vercel()
});