import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:3000",
    headless: false,
  },
  projects: [
    {
      name: "simulation",
      use: { browserName: "chromium" },
    },
  ],
});
