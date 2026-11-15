import { expect, test } from "@playwright/test";

test("system motion preference updates live without pause controls", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ivector-motion-paused", "true"));
  await page.goto("/");
  await expect(page.locator(".workspace-ambience")).toHaveAttribute("data-active", "true");
  await expect(page.getByRole("button", { name: /animations/i })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion-paused", "true");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-motion-paused", "false");
  await page.goto("/virtual-lab/");
  await expect(page.getByRole("button", { name: /animations/i })).toHaveCount(0);
});

test("position restores, entrance resets, and collisions stop the legs", async ({ page }) => {
  await page.clock.install(); await page.goto("/virtual-lab/"); await page.clock.runFor(150);
  const player = page.locator("[data-x]");
  await page.keyboard.down("w"); await page.clock.runFor(400); await page.keyboard.up("w");
  const y = await player.getAttribute("data-y");
  await page.reload(); await page.clock.runFor(150);
  await expect(player).toHaveAttribute("data-y", y!);
  await page.getByRole("button", { name: "Return to entrance" }).click();
  await expect(player).toHaveAttribute("data-y", "70");
  await page.keyboard.down("w"); await page.clock.runFor(5000);
  await expect(player).toHaveAttribute("data-walking", "false");
  await page.keyboard.up("w");
});

test("invalid saved position and blocked storage fall back safely", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("ivector-position-v1", JSON.stringify({ version: 1, x: -100, y: 0, facing: "left" }));
    Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });
  });
  await page.goto("/virtual-lab/");
  await expect(page.locator("[data-x]")).toHaveAttribute("data-x", "120");
  await expect(page.locator("html")).toHaveAttribute("data-motion-paused", "false");
});

test("cloud motion pauses offscreen and on hidden tabs", async ({ page }) => {
  await page.goto("/");
  const cloud = page.locator(".workspace-ambience");
  await expect(cloud).toHaveAttribute("data-active", "true");
  await expect(cloud.locator(".pixel-cloud")).toHaveCSS("animation-duration", "16s");
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(cloud).toHaveAttribute("data-active", "false");
  await cloud.scrollIntoViewIfNeeded();
  await expect(cloud).toHaveAttribute("data-active", "true");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(cloud).toHaveAttribute("data-active", "false");
});

test("unavailable session storage keeps movement and entrance reset usable", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "sessionStorage", { get() { throw new Error("blocked"); } }));
  await page.goto("/virtual-lab/");
  await expect(page.locator("[data-x]")).toHaveAttribute("data-x", "120");
  await page.getByRole("button", { name: "Return to entrance" }).click();
  await expect(page.getByRole("group", { name: "Walk around the lab" })).toBeFocused();
});
