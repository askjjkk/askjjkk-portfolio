import { defineConfig } from "vite";

export default defineConfig({
  base: "/askjjkk-portfolio/",
  build: {
    target: "es2022",
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/three/"))
            return id.includes("three.core") ? "three-core" : "three-renderer";
          if (id.includes("/gsap/") || id.includes("/lenis/")) return "motion";
        },
      },
    },
  },
});
