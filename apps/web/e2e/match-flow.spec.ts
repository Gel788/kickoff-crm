import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "demo123");
  await page.getByRole("button", { name: /Войти/i }).click();
}

test.describe("Полный поток пилота", () => {
  test("публичный API и live", async ({ request }) => {
    const standings = await request.get("/api/v1/demo/standings");
    expect(standings.ok()).toBeTruthy();
    const body = await standings.json();
    expect(body.standings).toBeDefined();

    const live = await request.get("/api/v1/demo/live");
    expect(live.ok()).toBeTruthy();

    const players = await request.get("/api/v1/demo/players");
    expect(players.ok()).toBeTruthy();
  });

  test("оператор: календарь и дисциплина", async ({ page }) => {
    await login(page, "operator@kickoff.app");
    await page.waitForURL(/\/league\//);

    await page.goto("/league/calendar");
    await expect(page.locator("body")).toBeVisible();

    await page.goto("/league/disciplinary");
    await expect(page.getByRole("heading", { name: /Дисциплина/i })).toBeVisible();
  });

  test("судья: консоль матча", async ({ page }) => {
    await login(page, "referee@kickoff.app");
    await page.waitForURL(/\/referee/);

    const matchLink = page.locator('a[href^="/referee/match/"]').first();
    if (await matchLink.count()) {
      await matchLink.click();
      await expect(page.getByText(/Счёт/i)).toBeVisible();
    }
  });

  test("клуб: кабинет и заявочный лист", async ({ page }) => {
    await login(page, "coach@kickoff.app");
    await page.waitForURL(/\/club/);

    await page.goto("/club/roster");
    await expect(page.locator("body")).toContainText(/заявоч|состав|roster/i);
  });

  test("опекун: мои дети", async ({ page }) => {
    await login(page, "parent@kickoff.app");
    await page.waitForURL(/\/guardian/);
    await expect(page.getByRole("heading", { name: /Мои дети/i })).toBeVisible();
  });

  test("platform admin", async ({ page }) => {
    await login(page, "admin@kickoff.app");
    await page.waitForURL(/\/platform/);
    await expect(page.getByRole("heading", { name: /платформы/i })).toBeVisible();
  });
});
