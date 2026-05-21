/**
 * E2E smoke (запуск после: npx playwright install && npx playwright test)
 * Полный матч — расширить в match-flow.spec.ts по PILOT_IDEAL.
 */
import { test, expect } from "@playwright/test";

test("главная и логин открываются", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Вход/i })).toBeVisible();
});

test("оператор видит дашборд лиги", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "operator@kickoff.app");
  await page.fill('input[name="password"]', "demo123");
  await page.getByRole("button", { name: /Войти/i }).click();
  await page.waitForURL(/\/league\//);
  await expect(page.locator("body")).toContainText(/лиг|дашборд|матч/i);
});
