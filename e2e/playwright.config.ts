import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "bun run dev:api",
      port: 3001,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "bun run dev:web",
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
