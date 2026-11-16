import { expect, test } from "@playwright/test";
import { atmosphereKey, defaultAtmosphere, readAtmosphere, taiwanLighting } from "../src/components/atmosphere-preference";

test("Taiwan time boundaries and stored preferences are validated", () => {
  for (const [time, expected] of [
    ["2026-11-15T21:59:00Z", "night"], ["2026-11-15T22:00:00Z", "day"],
    ["2026-11-16T09:59:00Z", "day"], ["2026-11-16T10:00:00Z", "night"],
  ]) expect(taiwanLighting(new Date(time))).toBe(expected);
  for (const value of [null, "broken", "{}", '{"version":2,"mode":"automatic","lighting":"night"}', '{"version":1,"mode":"unknown","lighting":"day"}']) {
    expect(readAtmosphere(value)).toEqual(defaultAtmosphere);
  }
  expect(readAtmosphere('{"version":1,"mode":"manual","lighting":"night"}').lighting).toBe("night");
});

test("Manual Day is default even at night and manual choices persist", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-16T12:00:00Z") });
  await page.goto("/");
  await expect(page.getByRole("switch", { name: "Night atmosphere" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Night atmosphere" })).not.toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "day");
  await page.getByRole("switch", { name: "Night atmosphere" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "night");
  await page.reload();
  await expect(page.getByRole("switch", { name: "Night atmosphere" })).toBeChecked();
  await page.clock.setSystemTime(new Date("2026-11-17T04:00:00Z"));
  await page.clock.runFor(61_000);
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "night");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(37, 39, 36)");
});

test("Automatic mode follows Taiwan time and refreshes after hidden-tab return", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-16T09:59:30Z") });
  await page.goto("/");
  await page.getByRole("button", { name: "Choose atmosphere" }).click();
  await page.getByRole("radio", { name: "Automatic", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "day");
  await page.clock.runFor(61_000);
  await expect(page.locator("html")).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.clock.setSystemTime(new Date("2026-11-16T22:00:00Z"));
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "night");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "day");
});

test("malformed or unavailable storage falls back to Manual Day", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "broken"), atmosphereKey);
  await page.goto("/");
  await expect(page.getByRole("switch", { name: "Night atmosphere" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Night atmosphere" })).not.toBeChecked();
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }));
  await page.reload();
  await expect(page.getByRole("switch", { name: "Night atmosphere" })).not.toBeChecked();
  await page.getByRole("switch", { name: "Night atmosphere" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "night");
});

test("atmosphere sync preserves Virtual Lab position, dialogue and focus", async ({ page, context }) => {
  await page.addInitScript(() => sessionStorage.setItem("ivector-position-v1", JSON.stringify({ version: 1, x: 60, y: 54, facing: "down" })));
  await page.goto("/virtual-lab/");
  const player = page.locator("[data-x]");
  await expect(player).toHaveAttribute("data-x", "60");
  await page.getByRole("button", { name: "Talk to Research Guide", exact: true }).first().click();
  const destination = page.getByRole("link", { name: "Open Research", exact: true });
  await expect(destination).toBeFocused();
  const other = await context.newPage(); await other.goto("/");
  await other.getByRole("switch", { name: "Night atmosphere" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere", "night");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(destination).toBeFocused();
  await expect(player).toHaveAttribute("data-x", "60");
  await expect(player).toHaveAttribute("data-y", "54");
  await other.close();
});

test("Day artwork and navigation work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('[data-artwork="workspace"]')).toBeVisible();
  await expect(page.getByRole("group", { name: "Atmosphere", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Enter Virtual Lab", exact: true }).click();
  await expect(page.locator('[data-artwork="lab-map"]')).toBeVisible();
  await expect(page.getByRole("link", { name: "Research", exact: true })).toBeVisible();
  await context.close();
});
