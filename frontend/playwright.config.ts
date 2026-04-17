import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  webServer: [
    {
      command:
        'set JWT_SIGNING_KEY=playwright-dev-signing-key-1234567890&& dotnet run --project ../backend/HelloWorldApi/HelloWorldApi.csproj --urls http://127.0.0.1:7001',
      url: 'http://127.0.0.1:7001/swagger/index.html',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'set VITE_PROXY_TARGET=http://127.0.0.1:7001&& npm run dev -- --host localhost --port 5173',
      url: 'http://localhost:5173',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results/playwright',
});
