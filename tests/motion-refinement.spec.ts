import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const interruption of ["offscreen", "hidden tab", "Night", "reduced motion"]) {
  test(`cloud interruption by ${interruption} consumes the run`, async ({ page }) => {
    await page.goto("/");
    const cloud = page.locator("[data-cloud-state]");
    await expect(cloud).toHaveAttribute("data-cloud-state", "running");
    if (interruption === "offscreen") await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    if (interruption === "hidden tab") await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange"));
    });
    if (interruption === "Night") await page.getByRole("switch", { name: "Night atmosphere" }).click();
    if (interruption === "reduced motion") await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(cloud).toHaveAttribute("data-cloud-state", "settled");
    if (interruption === "offscreen") await cloud.scrollIntoViewIfNeeded();
    if (interruption === "hidden tab") await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange"));
    });
    if (interruption === "Night") await page.getByRole("switch", { name: "Night atmosphere" }).click();
    if (interruption === "reduced motion") await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(cloud).toHaveAttribute("data-cloud-state", "settled");
    await expect(cloud.locator(".pixel-cloud")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
    expect(await cloud.locator(".pixel-cloud").evaluate(node => node.getAnimations().length)).toBe(0);
  });
}

test("initial reduced motion consumes cloud and About entrances", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-cloud-state]")).toHaveAttribute("data-cloud-state", "settled");
  await expect(page.locator("[data-about-motion]")).toHaveAttribute("data-about-motion", "settled");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("[data-about-motion]").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-about-motion]")).toHaveAttribute("data-about-motion", "settled");
  await expect(page.locator("[data-cloud-state]")).toHaveAttribute("data-cloud-state", "settled");
});

test("About entrance is independent of the running cloud and skips direct fragments", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.addInitScript(() => {
    (window as unknown as { aboutCloudStates: string[] }).aboutCloudStates = [];
    document.addEventListener("animationstart", event => {
      if (event.target instanceof Element && event.target.hasAttribute("data-about-motion")) {
        (window as unknown as { aboutCloudStates: string[] }).aboutCloudStates.push(document.querySelector("[data-cloud-state]")?.getAttribute("data-cloud-state") || "missing");
      }
    });
  });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => (window as unknown as { aboutCloudStates: string[] }).aboutCloudStates)).toContain("running");
  const about = page.locator("[data-about-motion]");
  await expect(about).toHaveAttribute("data-about-motion", "settled");
  await expect(about).toHaveCSS("opacity", "1");
  await page.goto("/#about-the-lab");
  await expect(about).toHaveAttribute("data-about-motion", "settled");
  await expect(about).toHaveCSS("transform", "none");
});

test("theme commits suppress palette transitions and restore hover timing", async ({ page, context }) => {
  await page.addInitScript(() => {
    (window as unknown as { commitDurations: string[] }).commitDurations = [];
    new MutationObserver(() => {
      if (document.documentElement?.dataset.themeChanging === "true") {
        (window as unknown as { commitDurations: string[] }).commitDurations.push(getComputedStyle(document.documentElement).getPropertyValue("--motion-color-duration").trim());
      }
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ["data-theme-changing", "data-atmosphere"] });
  });
  await page.goto("/");
  const toggle = page.getByRole("switch", { name: "Night atmosphere" });
  await toggle.click();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(37, 39, 36)");
  await expect.poll(() => page.evaluate(() => (window as unknown as { commitDurations: string[] }).commitDurations.length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => (window as unknown as { commitDurations: string[] }).commitDurations.every(value => parseFloat(value) === 0))).toBe(true);
  await expect(page.locator("html")).not.toHaveAttribute("data-theme-changing", "true");
  await expect.poll(() => page.evaluate(() => (() => { const value = getComputedStyle(document.documentElement).getPropertyValue("--motion-color-duration").trim(); return parseFloat(value) * (value.endsWith("ms") ? 1 : 1000); })())).toBe(180);
  await expect(toggle.locator("span").first()).toHaveCSS("transition-duration", "0.14s");
  await toggle.click(); await toggle.click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme-changing", "true");
  const other = await context.newPage(); await other.goto("/");
  await other.getByRole("switch", { name: "Night atmosphere" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "day");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme-changing", "true");
  await other.close();
});

test("motion review records desktop and mobile interaction evidence", async ({ browser, baseURL }, testInfo) => {
  for (const width of [1280, 320]) {
    const context = await browser.newContext({ baseURL, viewport: { width, height: 900 }, recordVideo: { dir: testInfo.outputPath(`video-${width}`) } });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Tracing.start", { categories: "devtools.timeline", transferMode: "ReturnAsStream" });
    await page.goto("/");
    await expect(page.locator("[data-cloud-state]")).toHaveAttribute("data-cloud-state", "running");
    await expect(page.locator("[data-cloud-state]")).toHaveAttribute("data-cloud-state", "settled", { timeout: 6000 });
    await page.locator("[data-about-motion]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-about-motion]")).toHaveAttribute("data-about-motion", "settled");
    await page.goto("/virtual-lab/");
    const scene = page.getByRole("group", { name: "Walk around the lab" });
    await expect(scene).toBeFocused(); await expect(scene).toHaveAttribute("data-motion-active", "true");
    await page.keyboard.down("w");
    // Hold input briefly so the recording contains actual displacement and leg motion.
    await page.waitForTimeout(300);
    await page.keyboard.up("w");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion-paused", "true");
    await page.screenshot({ path: testInfo.outputPath(`motion-${width}.png`), fullPage: true });
    const completed = new Promise<string>(resolve => cdp.once("Tracing.tracingComplete", event => resolve(event.stream!)));
    await cdp.send("Tracing.end");
    const stream = await completed;
    let trace = "";
    for (;;) { const chunk = await cdp.send("IO.read", { handle: stream }); trace += chunk.data; if (chunk.eof) break; }
    await cdp.send("IO.close", { handle: stream });
    await writeFile(testInfo.outputPath(`performance-${width}.json`), trace);
    await context.tracing.stop({ path: testInfo.outputPath(`trace-${width}.zip`) });
    await context.close();
  }
});
