import { expect, test } from "@playwright/test";

test("accent finishes once and stays still after system preference changes", async ({ page }, testInfo) => {
  await page.goto("/research/");
  const accent = page.locator("[data-kind]");
  await expect(accent).toHaveAttribute("data-play", "true");
  await expect(accent).toHaveAttribute("data-play", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion-paused", "true");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(accent).toHaveAttribute("data-play", "false");
  await page.screenshot({ path: testInfo.outputPath("research-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/people/");
  await expect(page.locator("[data-kind]")).toHaveAttribute("data-play", "false");
  await page.screenshot({ path: testInfo.outputPath("people-mobile.png"), fullPage: true });
});

test("academic accents stay decorative and still under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["about", "research", "projects", "people", "publications"]) {
    await page.goto(`/${route}/`);
    const accent = page.locator("[data-kind]");
    await expect(accent).toHaveAttribute("aria-hidden", "true");
    await expect(accent).toHaveAttribute("data-play", "false");
    expect(await accent.evaluate(node => getComputedStyle(node).pointerEvents)).toBe("none");
  }
});

test("email copying reports success and failure while keeping mail links", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => { (window as unknown as { copied: string }).copied = text; } } });
  });
  await page.goto("/people/");
  const copy = page.getByRole("button", { name: "Copy email 611521418@gms.ndhu.edu.tw", exact: true });
  await copy.click();
  await expect(page.getByText("Copied", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe("611521418@gms.ndhu.edu.tw");
  await expect(page.getByText("Copied", { exact: true })).toHaveCount(0);
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error("denied"); }; });
  await copy.click();
  await expect(page.getByText("Select email to copy", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "611521418@gms.ndhu.edu.tw", exact: true })).toHaveAttribute("href", "mailto:611521418@gms.ndhu.edu.tw");
});
