import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { navigation } from "../src/data/site";
import { people, projects, publications, researchAreas } from "../src/data/content";

test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.removeItem("ivector-position-v1")); });

const destinations = navigation.slice(2, 6);
const emptyStates = [
  { href: "/research/", records: researchAreas, text: "No research areas listed." },
  { href: "/projects/", records: projects, text: "No projects listed." },
  { href: "/people/", records: people, text: "No member profiles listed." },
  { href: "/publications/", records: publications, text: "No publications listed." },
];
const developmentCopy = /\bpreview\b|pending approval|\bplaceholder\b|\bTODO\b/i;

test("Home hero opens the lab and research by keyboard and touch", async ({ page, browser, baseURL }) => {
  await page.goto("/");
  const enter = page.getByRole("link", { name: "Enter Virtual Lab" });
  await enter.focus();
  await expect(enter).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/virtual-lab/");

  const mobile = await browser.newContext({ baseURL, viewport: { width: 320, height: 900 }, hasTouch: true });
  try {
    const touchPage = await mobile.newPage();
    await touchPage.goto("/");
    await touchPage.getByRole("link", { name: "Explore Research", exact: true }).tap();
    await expect(touchPage).toHaveURL("/research/");
  } finally {
    await mobile.close();
  }
});

for (const width of [320, 767, 768, 896, 1280]) {
  test(`exported pages fit a ${width}px viewport`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });

    for (const { href, label } of navigation) {
      const response = await page.goto(href);
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).not.toContainText(developmentCopy, { useInnerText: true });
      const emptyState = emptyStates.find(state => state.href === href);
      if (emptyState && !emptyState.records.length) {
        await expect(page.getByRole("main").getByText(emptyState.text, { exact: true })).toBeVisible();
      }
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page).toHaveTitle(href === "/" ? /iVector Lab/ : new RegExp(label));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S/);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => [...document.fonts].some(
        (font) => font.family.includes("Pixelify Sans") && font.status === "loaded",
      ))).toBe(true);
      expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Plus Jakarta Sans");
      await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-family", /Pixelify Sans/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

      if (href === "/" || href === "/virtual-lab/") {
        expect(await page.locator("main img").evaluate((image: HTMLImageElement) => image.decode().then(() => image.naturalWidth))).toBeGreaterThan(0);
      }
      if (href === "/virtual-lab/") {
        const signs = page.locator("[data-room]");
        await expect(signs).toHaveCount(4);
        await expect(page.getByRole("group", { name: "Walk around the lab" }).getByRole("button")).toHaveCount(4);
        const buttons = await page.getByRole("group", { name: "Walk around the lab" }).getByRole("button").all();
        for (const sign of await signs.all()) {
          expect(await sign.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(12);
          const box = (await sign.boundingBox())!;
          for (const button of buttons) {
            const hit = (await button.boundingBox())!;
            const overlaps = box.x < hit.x + hit.width && box.x + box.width > hit.x && box.y < hit.y + hit.height && box.y + box.height > hit.y;
            expect(overlaps, `${await sign.textContent()} sign overlaps ${await button.getAttribute("aria-label")} at ${width}px`).toBe(false);
          }
        }
      }
      if (width === 1280 || width === 320 || href === "/virtual-lab/") {
        await page.screenshot({ path: testInfo.outputPath(`${label}.png`), fullPage: true });
      }
    }

    const sceneLinks = page.getByRole("navigation", { name: "Scene destinations" }).getByRole("link");
    await expect(sceneLinks).toHaveCount(4);
    for (const [index, { href, label }] of destinations.entries()) {
      const link = sceneLinks.nth(index);
      await expect(link).toHaveAccessibleName(label);
      await expect(link).toHaveAttribute("href", href);
      if (width < 768) expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
  });
}

test("keyboard users can open the menu and follow Virtual Lab links", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  const menu = page.getByText("Menu", { exact: true });
  await menu.focus();
  await page.keyboard.press("Enter");
  const mobileNav = page.getByRole("navigation", { name: "Primary" });
  await expect(mobileNav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(mobileNav).toHaveCount(0);
  await page.keyboard.press("Enter");
  await mobileNav.getByRole("link", { name: "About" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(mobileNav).toHaveCount(0);

  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const { href, label } of destinations) {
      await page.goto("/virtual-lab/");
      const link = page.getByRole("link", { name: label, exact: true });
      await link.focus();
      await expect(link).toHaveCSS("outline-style", "solid");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    }
    await page.goto("/virtual-lab/");
    await page.getByRole("link", { name: "Back to Website" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
  }
});

test("touch users can open the menu and use all Virtual Lab destinations", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 900 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await page.getByText("Menu", { exact: true }).tap();
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Virtual Lab" }).tap();
    await expect(page).toHaveURL("/virtual-lab/");
    for (const { href, label } of destinations) {
      await page.goto("/virtual-lab/");
      await page.getByRole("link", { name: label, exact: true }).tap();
      await expect(page).toHaveURL(href);
    }
    await page.goto("/virtual-lab/");
    await page.getByRole("link", { name: "Back to Website" }).tap();
    await expect(page).toHaveURL("/");
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  } finally {
    await context.close();
  }
});

test("key layouts pass automated accessibility checks and missing URLs return 404", async ({ page }) => {
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const { href } of navigation) {
      await page.goto(href);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(results.violations, `${href} at ${width}px`).toEqual([]);
    }
  }
  const response = await page.goto("/missing-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(developmentCopy, { useInnerText: true });
});
