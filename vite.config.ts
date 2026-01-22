import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // GitHub Pages base path (Project Pages: /<repo>/)
  const ghRepo = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
  const ghBase =
    process.env.GITHUB_ACTIONS === "true" && ghRepo ? `/${ghRepo}/` : "/";

  return {
    base: ghBase,
    plugins: [react()],

    // ✅ خليك حاط كل إعداداتك الأصلية هون (alias/define/etc)
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
      },
    },

    // مثال إذا كان عندك define سابقاً (اتركه زي ما هو عندك)
    // define: { __APP_ENV__: JSON.stringify(env.APP_ENV) },
  };
});
