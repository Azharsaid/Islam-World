import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async () => {
  // GitHub Pages Project URL = /<repo>/
  const ghRepo = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
  const ghBase =
    process.env.GITHUB_ACTIONS === "true" && ghRepo ? `/${ghRepo}/` : "/";

  return {
    base: ghBase,

    // ✅ هنا المهم: خَلّي الجذر هو client (مكان index.html)
    root: path.resolve(__dirname, "client"),

    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },

    // ✅ وخلي الخرج ثابت على dist/public عشان الـ Pages workflow يرفعه
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});
