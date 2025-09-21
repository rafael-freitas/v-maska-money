import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(process.cwd(), "src/index.ts"),
      name: "MaskaMoney",
      fileName: (format) => `maska-money.${format}.js`,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: { vue: "Vue" },
        exports: "named", // força exports nomeados (recomendado p/ libs)
      },
    },
    // opcional: gerar bundle legível
    // minify: false
  },
});
