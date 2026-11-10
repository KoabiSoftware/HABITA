import { defineConfig } from "astro/config";
// Astro solo genera contenido editorial estático. Next sirve estos archivos.
export default defineConfig({
  output: "static",
  outDir: "../web/public/journal",
  build: { format: "directory" },
});
