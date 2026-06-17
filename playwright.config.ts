import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 240_000,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    headless: false,
  },
  projects: [
    {
      name: "simulation",
      use: { browserName: "chromium" },
    },
  ],
});
