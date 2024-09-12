import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  root: '.',
  plugins: [vue(), crx({ manifest })],
});
