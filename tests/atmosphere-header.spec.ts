import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { navigation } from "../src/data/site";

test("every route has one header switch and picker works with keyboard", async ({ page }, testInfo) => {
  for (const { href } of [...navigation, { href: "/missing-page/" }]) {
    await page.goto(href);
    await expect(page.getByRole("switch", { name: "Night atmosphere" })).toHaveCount(1);
    await expect(page.getByRole("banner").getByRole("switch")).toBeVisible();
    await expect(page.getByRole("main").getByRole("group", { name: "Atmosphere", exact: true })).toHaveCount(0);
  }
  await page.goto("/");
  const picker = page.getByRole("button", { name: "Choose atmosphere" });
  await picker.focus(); await page.keyboard.press("Enter");
  await expect(picker).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("radio", { name: "Day", exact: true })).toBeFocused();
  await page.getByRole("radio", { name: "Automatic" }).check();
  await expect(picker).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape"); await expect(picker).toBeFocused();
  await expect(picker).toHaveAttribute("aria-expanded", "false");
  const toggle = page.getByRole("switch");
  const before = await toggle.getAttribute("aria-checked");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", before === "true" ? "false" : "true");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ivector-atmosphere-v1")!).mode)).toBe("manual");
  await picker.click(); await page.getByRole("heading", { level: 1 }).click();
  await expect(picker).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 320, height: 900 }); await picker.click();
  const panel = page.locator(":popover-open");
  const box = (await panel.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("header-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: testInfo.outputPath("header-desktop.png"), fullPage: true });
});

test("touch and reduced motion keep header controls usable", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 900 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await page.goto("/virtual-lab/");
  const toggle = page.getByRole("switch");
  const box = (await toggle.boundingBox())!; expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44);
  await toggle.tap(); await expect(toggle).toBeChecked();
  await expect(toggle.locator("span").first()).toHaveCSS("transition-duration", "0s");
  await page.getByRole("button", { name: "Choose atmosphere" }).tap();
  await page.getByRole("radio", { name: "Day", exact: true }).check();
  await expect(toggle).not.toBeChecked(); await context.close();
});
