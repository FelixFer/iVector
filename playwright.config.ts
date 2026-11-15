import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "chrome",
  },
  webServer: {
    command: "npm run preview",
    url: baseURL,
    timeout: 30_000,
  },
});
