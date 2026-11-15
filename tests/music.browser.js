import { test, expect } from "@playwright/test";

async function openPlayer(page) {
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__portfolioReady === true);
  const player = page.getByRole("region", { name: "Музыка по желанию" });
  await expect(player).toBeVisible({ timeout: 5000 });
  await player.scrollIntoViewIfNeeded();
  return player;
}

test("плеер не запускается сам, играет файл и поддерживает клавиатуру и перемотку", async ({ page }, testInfo) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".mp3")) requests.push(request.url());
  });
  const player = await openPlayer(page);
  const audio = page.locator("#music-audio");
  await expect(player).toContainText("Ванна, красный пол");
  await expect(player).toContainText("CUPSIZE");
  await expect.poll(() => player.locator("img").evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect.poll(() => audio.evaluate((el) => el.paused)).toBe(true);
  expect(requests).toEqual([]);
  await expect(player.getByRole("slider")).toBeDisabled();
  await player.screenshot({ path: `artifacts/music-idle-${testInfo.project.name}.png` });

  await player.getByRole("button", { name: "Включить музыку", exact: true }).click();
  await expect.poll(() => audio.evaluate((el) => !el.paused && el.currentTime > 0)).toBe(true);
  await expect(player.getByRole("slider")).toBeEnabled();
  await expect(player.locator("[data-music-duration]")).not.toHaveText("—:—");
  await expect(player).toHaveClass(/is-playing/);
  await player.getByRole("button", { name: "Поставить на паузу" }).click();
  await expect.poll(() => audio.evaluate((el) => el.paused)).toBe(true);
  const seek = player.getByRole("slider", { name: "Позиция в треке" });
  await seek.focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  await expect.poll(() => audio.evaluate((el) => el.currentTime)).toBeGreaterThanOrEqual(4);
  await player.getByRole("button", { name: "Включить музыку", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect.poll(() => audio.evaluate((el) => !el.paused)).toBe(true);
  await page.locator("#process").scrollIntoViewIfNeeded();
  await expect.poll(() => audio.evaluate((el) => !el.paused)).toBe(true);
  await audio.evaluate((el) => { el.currentTime = el.duration - 0.2; });
  await expect(player.getByRole("button", { name: "Включить музыку", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => audio.evaluate((el) => el.ended)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("ошибка аудио даёт повторить запуск без перезагрузки страницы", async ({ page }) => {
  await page.route("**/media/*.mp3", (route) => route.abort());
  const player = await openPlayer(page);
  await player.getByRole("button", { name: "Включить музыку", exact: true }).click();
  await expect(player.getByRole("status")).toContainText("Не удалось загрузить");
  await expect(player.getByRole("button", { name: "Повторить воспроизведение" })).toBeEnabled();
  await page.unroute("**/media/*.mp3");
  await player.getByRole("button", { name: "Повторить воспроизведение" }).click();
  await expect.poll(() => page.locator("#music-audio").evaluate((el) => !el.paused && el.currentTime > 0)).toBe(true);
  await player.getByRole("button", { name: "Поставить на паузу" }).click();
});

test("загрузку можно отменить, reduced-motion не анимирует индикатор", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route("**/media/*.mp3", async (route) => {
    await gate;
    await route.continue();
  });
  const player = await openPlayer(page);
  await player.getByRole("button", { name: "Включить музыку", exact: true }).click();
  await expect(player.getByRole("status")).toHaveText("Загружаю трек…");
  await player.getByRole("button", { name: "Отменить загрузку" }).click();
  release();
  await expect(player.getByRole("button", { name: "Включить музыку", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => page.locator("#music-audio").evaluate((el) => el.paused)).toBe(true);
  await expect(player).not.toHaveClass(/is-loading|is-playing/);
  const indicator = player.locator(".music-signal i").first();
  await expect(indicator).toHaveCSS("animation-name", "none");
});
