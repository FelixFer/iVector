import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { navigation } from "../src/data/site";

test("navigation hover and focus feedback stays in place and respects reduced motion", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("heading", { name: "Explore iVector Lab" }).locator("..").getByRole("link", { name: "About", exact: true });
  await link.scrollIntoViewIfNeeded();
  const before = await link.boundingBox();
  await link.hover();
  await expect(link).toHaveCSS("background-color", "rgb(220, 232, 245)");
  expect(await link.boundingBox()).toEqual(before);
  await link.focus();
  await expect(link).toHaveCSS("outline-style", "solid");
  await page.goto("/people/");
  const email = page.getByRole("link", { name: "611521418@gms.ndhu.edu.tw", exact: true });
  await email.focus();
  await expect(email).toHaveCSS("text-decoration-thickness", "2px");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/virtual-lab/");
  const destination = page.getByRole("navigation", { name: "Scene destinations" }).getByRole("link").first();
  await destination.hover(); await destination.focus();
  await expect(destination).toHaveCSS("outline-style", "solid");
  await expect(destination.locator("span")).toHaveCSS("transform", "none");
  await expect(destination).toHaveCSS("transition-duration", "0s");
});

for (const width of [320, 767, 768, 896, 1280]) {
  test(`Night artwork preserves all routes at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("switch", { name: "Night atmosphere" }).click();
    for (const { href, label } of navigation) {
      await page.goto(href);
      await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "night");
      await expect(page.locator("body")).toHaveCSS("background-color", "rgb(37, 39, 36)");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (href === "/" || href === "/virtual-lab/") {
        const art = page.locator("[data-artwork]");
        await expect(art).toBeVisible();
        await expect(art).toHaveCSS("pointer-events", "none");
        await page.screenshot({ path: testInfo.outputPath(`${label}-night.png`), fullPage: true });
        if (width === 320 || width === 1280) {
          expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
        }
      }
    }
  });
}
