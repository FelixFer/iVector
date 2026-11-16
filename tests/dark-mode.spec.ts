import { expect, test } from "@playwright/test";
import { themeInit } from "../src/components/theme-init";
import AxeBuilder from "@axe-core/playwright";
import { navigation } from "../src/data/site";

test("all Night routes pass accessibility and semantic color contrast", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("ivector-atmosphere-v1", '{"version":1,"mode":"manual","lighting":"night"}'));
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const { href, label } of [...navigation, { href: "/missing/", label: "404" }]) {
      await page.goto(href);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${label}-${width}-dark.png`), fullPage: true });
    }
  }
  const ratios = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const luminance = (token: string) => {
      const color = style.getPropertyValue(token).trim().slice(1);
      const channels = [0, 2, 4].map(i => { const c = parseInt(color.slice(i, i + 2), 16) / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; });
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    };
    return [["--color-text", "--color-bg"], ["--color-muted", "--color-paper"], ["--color-link", "--color-paper"], ["--color-on-accent", "--color-link"], ["--color-control-border", "--color-paper"]].map(([a, b]) => {
      const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
    });
  });
  ratios.forEach((ratio, index) => expect(ratio).toBeGreaterThanOrEqual(index === 4 ? 3 : 4.5));
});

test("saved Night initializes before body content and hydration", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ivector-atmosphere-v1", JSON.stringify({ version: 1, mode: "manual", lighting: "night" }));
    new MutationObserver(() => {
      if (document.body && !(window as unknown as { firstTheme?: string }).firstTheme) (window as unknown as { firstTheme: string }).firstTheme = document.documentElement.dataset.atmosphere || "missing";
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/");
  expect(await page.evaluate(() => (window as unknown as { firstTheme: string }).firstTheme)).toBe("night");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(37, 39, 36)");
  expect(themeInit).not.toContain("eval(");
});

test("picker follows its button across viewport widths and scrolling", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 767, 768, 896, 1152, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const button = page.getByRole("button", { name: "Choose atmosphere" });
    await button.click();
    const panel = page.locator(":popover-open");
    await expect(panel).toBeVisible();
    await expect.poll(async () => Math.round((await panel.boundingBox())!.y - (await button.boundingBox())!.y - (await button.boundingBox())!.height)).toBe(8);
    const box = (await panel.boundingBox())!, trigger = (await button.boundingBox())!;
    expect(Math.abs(box.x + box.width - trigger.x - trigger.width)).toBeLessThan(2);
    await expect(page.getByRole("radio", { name: "Automatic", exact: true })).toBeVisible();
    await expect(panel).not.toContainText("Taiwan");
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "Choose atmosphere" }).click();
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(page.locator(":popover-open")).toHaveCount(0);
});
