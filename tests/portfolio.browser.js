import { test, expect } from "@playwright/test";

async function openPage(page) {
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__portfolioReady === true);
  await expect(page.locator("#preloader")).toHaveCSS("visibility", "hidden");
}

test("Telegram, бизнес-сайты, реальные скриншоты и пилотный пакет", async ({
  page,
}) => {
  await openPage(page);
  const telegram = page.locator(".header-contact");
  await expect(telegram).toHaveAttribute("href", "https://t.me/askjjkk");
  await expect(telegram).not.toHaveAttribute("data-contact", "");
  const order = await page
    .locator(".project-card")
    .evaluateAll((cards) =>
      cards.slice(0, 3).map((card) => card.dataset.project),
    );
  expect(order).toEqual(["kktatoo", "heating", "bio"]);
  for (const id of ["kktatoo", "heating", "bio", "modsmith"]) {
    await page.locator(`[data-project="${id}"] .project-open`).click();
    await expect(page.locator("#project-modal")).toBeVisible();
    await expect(
      page.locator("#project-detail a", { hasText: "Посмотреть сайт" }),
    ).toHaveCount(1);
    await expect(page.locator("#gallery-image")).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator("#gallery-image")
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
    await page.locator('[data-screenshot="2"]').click();
    await expect(page.locator('[data-screenshot="2"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("#gallery-image")).toHaveAttribute(
      "src",
      new RegExp(`${id}-mobile.jpg$`),
    );
    await expect(page.locator("#gallery-caption")).toHaveText("Телефон");
    if (id === "heating")
      await expect(page.locator(".project-detail-status")).toContainText(
        "Демонстрационный",
      );
    await page.keyboard.press("Escape");
  }
  await page.locator('[data-service="pilot"]').click();
  await expect(page.locator("#client-service")).toHaveValue("pilot");
  await expect(page.locator("#minecraft-fields")).not.toBeVisible();
  await page.locator("#client-contact").fill("test@example.com");
  await page.locator("#client-description").fill("Нужен сайт для мастера");
  await page.evaluate(() => {
    window.__pilotMail = "";
    document.addEventListener(
      "click",
      (event) => {
        const anchor = event.target.closest('a[href^="mailto:"]');
        if (anchor) {
          event.preventDefault();
          window.__pilotMail = anchor.href;
        }
      },
      true,
    );
  });
  await page.locator("#contact-form button[type=submit]").click();
  const body = new URL(
    await page.evaluate(() => window.__pilotMail),
  ).searchParams.get("body");
  expect(body).toContain("7 900");
  expect(body).toContain("один круг правок");
  expect(body).toContain("Домен и хостинг оплачиваются отдельно");
});

test("сцена, адаптив, секции, ссылки и отсутствие ошибок", async ({
  page,
}, testInfo) => {
  const errors = [];
  const assetErrors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      response.url().includes("/askjjkk-portfolio/")
    )
      assetErrors.push(response.url());
  });
  await openPage(page);
  await expect(page.locator("html")).toHaveClass(/webgl-ready/);
  const width = testInfo.project.use.viewport.width;
  await expect(page.locator("#webgl-canvas")).toHaveAttribute(
    "data-instances",
    width < 768 ? "1152" : "2304",
  );
  await expect(page.locator(".project-card")).toHaveCount(8);
  await expect(page.locator(".mini-window")).toHaveCount(24);
  await expect(page.locator(".service-row")).toHaveCount(6);
  await expect(page.locator(".process-card")).toHaveCount(4);
  const qualityBounds = await page.evaluate(() => ({
    stage: document.querySelector(".quality-stage").getBoundingClientRect()
      .bottom,
    button: document.querySelector(".spec-button").getBoundingClientRect()
      .bottom,
  }));
  expect(qualityBounds.button).toBeLessThanOrEqual(qualityBounds.stage + 1);
  const anchorErrors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .filter((link) => !document.getElementById(link.hash.slice(1)))
        .map((link) => link.hash),
    );
  expect(anchorErrors).toEqual([]);
  await page.screenshot({ path: `artifacts/hero-${width}.png` });
  if (width < 768) {
    await page.locator(".menu-toggle").click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await page.locator('#mobile-nav a[href="#projects"]').click();
    await expect(page.locator("#mobile-nav")).not.toBeVisible();
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  }
  for (const selector of [
    "#projects",
    "#about",
    "#services",
    "#process",
    ".footer",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    const sizes = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      inner: innerWidth,
    }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.inner);
    await page.screenshot({
      path: `artifacts/${selector.replace(/[#.]/g, "")}-${width}.png`,
    });
  }
  await page.locator(".project-card").first().scrollIntoViewIfNeeded();
  if (width < 768)
    await expect(page.locator(".project-card").first()).toHaveClass(
      /is-fanned/,
    );
  else if (width > 1024) {
    await page.locator(".project-card").first().hover();
    const transform = await page
      .locator(".project-card")
      .first()
      .locator(".mini-0")
      .evaluate((el) => getComputedStyle(el).transform);
    expect(transform).not.toBe("none");
  }
  await page.locator('[data-project="umbra"] .project-open').click();
  await expect(page.locator("#project-modal")).toBeVisible();
  await expect(page.locator("#project-title")).toHaveText(
    "Umbra — лаунчер и игровой интерфейс",
  );
  await expect(page.locator("#project-detail")).toContainText(
    "Схематичное превью интерфейса",
  );
  await expect(page.locator("#project-detail a")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.locator("#project-modal")).not.toBeVisible();
  await expect(
    page.locator('[data-project="umbra"] .project-open'),
  ).toBeFocused();
  await page.locator(".quality-chapter").nth(2).scrollIntoViewIfNeeded();
  await expect(page.locator("#quality-counter")).toHaveText("03");
  if (width >= 768) {
    const sticky = await page.locator(".quality-showcase").boundingBox();
    expect(sticky.y).toBeGreaterThanOrEqual(90);
    expect(sticky.y + sticky.height).toBeLessThanOrEqual(
      testInfo.project.use.viewport.height,
    );
  }
  expect(assetErrors).toEqual([]);
  expect(errors).toEqual([]);
});

test("форма: услуга, Minecraft, валидация, фокус, mailto и копирование", async ({
  page,
  context,
}, testInfo) => {
  await openPage(page);
  await page.locator('[data-service="mc-mod"]').click();
  await expect(page.locator("#contact-modal")).toBeVisible();
  await expect(page.locator("#client-service")).toHaveValue("mc-mod");
  await expect(page.locator("#minecraft-fields")).toBeVisible();
  await expect(page.locator("#page-shell")).toHaveAttribute("inert", "");
  await page.locator("#contact-form button[type=submit]").click();
  await expect(page.locator("#client-contact")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("#client-contact")).toBeFocused();
  await expect(page.locator("#version-error")).not.toBeEmpty();
  await page.locator("#client-contact").fill("test@example.com");
  await page.locator("#client-version").fill("1.21.1");
  await page.locator("#client-platform").fill("Fabric");
  await page
    .locator("#client-description")
    .fill("Кисть & интерфейс\nТестовая задача + детали");
  await page.screenshot({
    path: `artifacts/form-${testInfo.project.use.viewport.width}.png`,
  });
  await page.evaluate(() => {
    window.__capturedMailto = "";
    document.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest('a[href^="mailto:"]');
        if (link) {
          event.preventDefault();
          window.__capturedMailto = link.href;
        }
      },
      true,
    );
  });
  await page.locator("#contact-form button[type=submit]").click();
  const mailto = await page.evaluate(() => window.__capturedMailto);
  expect(mailto).toContain("mailto:askjjkk03@gmail.com?");
  expect(new URL(mailto).searchParams.get("body")).toContain(
    "Платформа: Fabric",
  );
  await expect(page.locator("#form-status")).toContainText(
    "Письмо подготовлено",
  );
  await expect(page.locator("#form-status")).not.toContainText("отправлена");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator("#copy-request").click();
  await expect(page.locator("#form-status")).toContainText(
    "Заявка скопирована",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Кисть & интерфейс",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value: () => Promise.reject(new Error("denied")),
    }),
  );
  await page.locator("#copy-request").click();
  await expect(page.locator("#manual-copy")).toBeVisible();
  await expect(page.locator("#request-text")).toHaveValue(
    /Версия Minecraft: 1.21.1/,
  );
  await page.locator("#client-service").selectOption("landing");
  await expect(page.locator("#minecraft-fields")).not.toBeVisible();
  await page.locator("#copy-email").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#contact-modal [data-close]")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#contact-modal")).not.toBeVisible();
  await expect(page.locator('[data-service="mc-mod"]')).toBeFocused();
  expect(await page.locator("#page-shell").evaluate((el) => el.inert)).toBe(
    false,
  );
});

test("отказ WebGL, reduced-motion и медленные шрифты не блокируют контент", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith("webgl")
        ? null
        : getContext.call(this, type, ...args);
    };
  });
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await openPage(page);
  await expect(page.locator("html")).toHaveClass(/webgl-unavailable/);
  await expect(page.locator(".world-fallback")).toBeVisible();
  await expect(page.locator("h1")).toBeVisible();
  const before = await page
    .locator(".marquee-track")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(250);
  expect(
    await page
      .locator(".marquee-track")
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe(before);
  await page.locator(".footer [data-contact]").click();
  await expect(page.locator("#contact-modal")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator('.hero-buttons a[href="#projects"]').click();
  expect(await page.evaluate(() => window.location.hash)).toBe("#projects");
});

test("зависшая таблица шрифтов не блокирует первый экран и приложение", async ({
  page,
}) => {
  await page.route("https://fonts.googleapis.com/**", () => {});
  await page.goto("./", { waitUntil: "commit" });
  await page.waitForFunction(() => window.__portfolioReady === true, null, {
    timeout: 3500,
  });
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#preloader")).toHaveCSS("visibility", "hidden");
  await page.locator(".footer [data-contact]").click();
  await expect(page.locator("#contact-modal")).toBeVisible();
});
