import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import fs from "fs";
import { resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to copy the static folder into the build output
function copyStaticPlugin() {
  return {
    name: "copy-static-folder",
    closeBundle() {
      const src = resolve(__dirname, "static");
      const dest = resolve(__dirname, "dist/static");
      copyDirSync(src, dest);
    },
  };
}

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile(), copyStaticPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
