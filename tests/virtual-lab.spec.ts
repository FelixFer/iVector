import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { canStand, guideNear, guides, hasLineOfSight, move, movementSpeed, obstacles, roomAt, spawn, type Point } from "../src/app/virtual-lab/scene-data";

test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.removeItem("ivector-position-v1")); });

const routes: Point[][] = [
  [{ x: 120, y: 52 }, { x: 69, y: 52 }],
  [{ x: 120, y: 56 }, { x: 170, y: 56 }],
  [{ x: 120, y: 98 }, { x: 96, y: 98 }, { x: 96, y: 105 }],
  [{ x: 120, y: 98 }, { x: 139, y: 98 }, { x: 139, y: 114 }, { x: 148, y: 114 }, { x: 148, y: 120 }],
];

test("scene geometry supports all doorways, boundaries and guide interactions", () => {
  expect(canStand(spawn)).toBe(true);
  for (const [x, y, width, height] of obstacles) expect(canStand({ x: x + width / 2, y: y + height / 2 })).toBe(false);
  for (const point of [{ x: 0, y: 70 }, { x: 240, y: 70 }, { x: 120, y: 0 }, { x: 120, y: 140 }]) expect(canStand(point)).toBe(false);
  const straight = move(spawn, { x: 1, y: 0 }, 0.03);
  const diagonal = move(spawn, { x: 1, y: 1 }, 0.03);
  expect(Math.hypot(diagonal.x - spawn.x, diagonal.y - spawn.y)).toBeCloseTo(straight.x - spawn.x);
  expect(straight.x - spawn.x).toBeCloseTo(36 * 0.03);
  for (const point of [{ x: 110, y: 30 }, { x: 130, y: 30 }, { x: 30, y: 64 }, { x: 30, y: 76 }]) {
    expect(canStand(point)).toBe(true);
    expect(roomAt(point)).toBe("Central corridor");
  }
  expect(move(spawn, { x: 0, y: 0 }, 1)).toEqual(spawn);
  expect(roomAt(spawn)).toBe("Central corridor");
  for (const [index, route] of routes.entries()) {
    let point = { ...spawn };
    for (const target of route) {
      for (let step = 0; step < 500 && Math.hypot(target.x - point.x, target.y - point.y) > 0.5; step++) {
        point = move(point, { x: target.x - point.x, y: target.y - point.y }, 0.01);
        expect(canStand(point)).toBe(true);
      }
      expect(Math.hypot(target.x - point.x, target.y - point.y), `${guides[index].label}: ${JSON.stringify(point)} to ${JSON.stringify(target)}`).toBeLessThan(0.5);
    }
    expect(roomAt(point)).toBe(guides[index].label);
    expect(guideNear(point)).toEqual(guides[index]);
    const guide = guides[index];
    expect(guideNear({ x: guide.x, y: guide.y - 12 })).toEqual(guide);
    expect(guideNear({ x: guide.x, y: guide.y - 12.1 })).toBeUndefined();
  }
  let blocked = { x: 120, y: 30 };
  for (let i = 0; i < 100; i++) blocked = move(blocked, { x: -1, y: 0 }, 0.05);
  expect(blocked.x).toBeGreaterThanOrEqual(109.5);
});

async function position(page: Page) {
  return page.locator("[data-x]").evaluate(element => ({ x: Number(element.getAttribute("data-x")), y: Number(element.getAttribute("data-y")) }));
}

async function walkTo(page: Page, target: Point) {
  const current = await position(page);
  for (const axis of ["x", "y"] as const) {
    const distance = target[axis] - current[axis];
    if (Math.abs(distance) < 0.5) continue;
    const key = axis === "x" ? distance > 0 ? "d" : "a" : distance > 0 ? "s" : "w";
    await page.keyboard.down(key);
    await page.clock.runFor(Math.abs(distance) / movementSpeed * 1000);
    await page.keyboard.up(key);
  }
}

test("walls block sight and proximity while open doorways permit interaction", () => {
  for (const [point, guide] of [
    [{ x: 60, y: 64 }, guides[0]],
    [{ x: 180, y: 64 }, guides[1]],
    [{ x: 110, y: 114 }, guides[2]],
    [{ x: 130, y: 122 }, guides[3]],
  ] as const) {
    expect(canStand(point)).toBe(true);
    expect(hasLineOfSight(point, guide)).toBe(false);
    expect(hasLineOfSight(guide, point)).toBe(false);
    expect(guideNear(point)).toBeUndefined();
  }
  expect(hasLineOfSight({ x: 110, y: 52 }, { x: 100, y: 52 })).toBe(true);
  expect(hasLineOfSight({ x: 130, y: 98 }, { x: 140, y: 98 })).toBe(true);
  expect(hasLineOfSight({ x: 110, y: 42 }, { x: 100, y: 44 })).toBe(false);
  expect(hasLineOfSight({ x: 60, y: 52 }, guides[0])).toBe(true);
});

test("cannot talk across a wall using E or direct NPC activation", async ({ page }) => {
  await page.clock.install();
  await page.goto("/virtual-lab/"); await page.clock.runFor(100);
  const scene = page.getByRole("group", { name: "Walk around the lab" });
  const guide = scene.getByRole("button", { name: "Talk to Research Guide" });
  await walkTo(page, { x: 60, y: 70 }); await walkTo(page, { x: 60, y: 64 });
  await expect(guide).toBeDisabled();
  await expect(page.getByTestId("talk-prompt")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Talk to Research Guide" })).toHaveCount(1);
  await page.keyboard.press("e");
  await guide.evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await walkTo(page, { x: 120, y: 64 });
  await walkTo(page, { x: 120, y: 52 }); await walkTo(page, { x: 69, y: 52 });
  await expect(guide).toBeEnabled();
  await expect(page.getByTestId("talk-prompt")).toBeVisible();
  await guide.click();
  await expect(page.getByRole("dialog", { name: "Research Guide" })).toBeVisible();
});

test("keyboard movement starts immediately on direct and Home arrivals without scrolling", async ({ page }) => {
  await page.clock.install();
  for (const fromHome of [false, true]) {
    if (fromHome) {
      await page.goto("/");
      await page.getByRole("link", { name: "Enter Virtual Lab", exact: true }).click();
    } else await page.goto("/virtual-lab/");
    const scene = page.getByRole("group", { name: "Walk around the lab" });
    await page.clock.runFor(100);
    await expect(scene).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.keyboard.down("w"); await page.clock.runFor(200); await page.keyboard.up("w");
    expect((await position(page)).y).toBeLessThan(spawn.y - 5);
    await page.keyboard.press("Tab");
    await expect(scene).not.toBeFocused();
    const stopped = await position(page);
    await page.keyboard.down("s"); await page.clock.runFor(200); await page.keyboard.up("s");
    expect(await position(page)).toEqual(stopped);
    await expect(scene).not.toBeFocused();
  }
});

test("arrival preserves a control focused before the scene becomes interactive", async ({ page }) => {
  let release!: () => void;
  const scripts = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\.js(?:\?|$)/, async route => { await scripts; await route.continue(); });
  await page.goto("/virtual-lab/", { waitUntil: "commit" });
  const back = page.getByRole("link", { name: "Back to Website" });
  await back.focus();
  release();
  await expect(page.getByRole("group", { name: "Walk around the lab" })).toHaveAttribute("tabindex", "0");
  await expect(back).toBeFocused();
});

test("walk to each guide, open dialogue with E, restore focus and follow its link", async ({ page }, testInfo) => {
  await page.clock.install();
  for (const [index, guide] of guides.entries()) {
    await page.goto("/virtual-lab/");
    await page.clock.runFor(100);
    const scene = page.getByRole("group", { name: "Walk around the lab" });
    await scene.focus();
    for (const target of routes[index]) await walkTo(page, target);
    await expect(page.getByRole("status")).toHaveText(guide.label);
    await expect(page.getByRole("button", { name: `Talk to ${guide.label} Guide` })).toHaveCount(2);
    await expect(page.getByTestId("talk-prompt").getByText("E to talk", { exact: true })).toBeVisible();
    const prompt = page.getByTestId("talk-prompt");
    await expect(prompt).toHaveCSS("pointer-events", "none");
    const sceneBox = (await scene.boundingBox())!, promptBox = (await prompt.boundingBox())!;
    expect(promptBox.x).toBeGreaterThanOrEqual(sceneBox.x);
    expect(promptBox.y).toBeGreaterThanOrEqual(sceneBox.y);
    expect(promptBox.x + promptBox.width).toBeLessThanOrEqual(sceneBox.x + sceneBox.width);
    expect(promptBox.y + promptBox.height).toBeLessThanOrEqual(sceneBox.y + sceneBox.height);
    if (index === 0) await page.screenshot({ path: testInfo.outputPath("nearby-desktop.png"), fullPage: true });
    await page.keyboard.press("e");
    const dialogue = page.getByRole("dialog", { name: `${guide.label} Guide` });
    await expect(dialogue).toBeVisible();
    const stopped = await position(page);
    await page.keyboard.down("ArrowRight"); await page.clock.runFor(400); await page.keyboard.up("ArrowRight");
    expect(await position(page)).toEqual(stopped);
    await page.keyboard.press("Escape");
    await expect(scene).toBeFocused();
    await page.keyboard.press("e");
    await dialogue.getByRole("link", { name: `Open ${guide.label}` }).click();
    await expect(page).toHaveURL(guide.href);
  }
});

test("accessible guide buttons and modal focus work after entering each room", async ({ page }, testInfo) => {
  await page.clock.install();
  await page.goto("/virtual-lab/");
  const scene = page.getByRole("group", { name: "Walk around the lab" });
  for (const [index, guide] of guides.entries()) {
    await page.goto("/virtual-lab/"); await page.clock.runFor(100);
    await scene.focus();
    for (const target of routes[index]) await walkTo(page, target);
    const button = scene.getByRole("button", { name: `Talk to ${guide.label} Guide` });
    await button.focus(); await page.keyboard.press("Enter");
    const dialogue = page.getByRole("dialog");
    await expect(dialogue).toHaveAccessibleName(`${guide.label} Guide`);
    if (guide === guides[0]) await page.screenshot({ path: testInfo.outputPath("dialogue-desktop.png"), fullPage: true });
    await dialogue.getByRole("button", { name: "Close", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(dialogue.getByRole("link")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialogue.getByRole("button", { name: "Close", exact: true })).toBeFocused();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.keyboard.press("Enter");
    await expect(button).toBeFocused();
  }
});

test("movement stops on release, focus loss, visibility change and pointer cancellation", async ({ page }) => {
  await page.clock.install();
  await page.goto("/virtual-lab/"); await page.clock.runFor(100);
  const scene = page.getByRole("group", { name: "Walk around the lab" });
  await scene.focus();
  await page.keyboard.down("ArrowUp"); await page.clock.runFor(200); await page.keyboard.up("ArrowUp");
  expect((await position(page)).y).toBeLessThan(spawn.y);
  let stopped = await position(page); await page.clock.runFor(300); expect(await position(page)).toEqual(stopped);
  for (const event of ["blur", "visibilitychange"]) {
    await scene.focus(); await page.keyboard.down("w"); await page.clock.runFor(100);
    await page.evaluate(name => (name === "blur" ? window : document).dispatchEvent(new Event(name)), event);
    stopped = await position(page); await page.clock.runFor(300); expect(await position(page)).toEqual(stopped);
    await page.keyboard.up("w");
  }
  await scene.focus(); await page.keyboard.down("d"); await page.keyboard.press("Tab");
  stopped = await position(page); await page.clock.runFor(300); expect(await position(page)).toEqual(stopped);
  await page.keyboard.up("d");
  const down = page.getByRole("button", { name: "Move down" });
  await down.scrollIntoViewIfNeeded();
  const box = (await down.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.clock.runFor(200);
  expect((await position(page)).y).toBeGreaterThan(stopped.y);
  await down.dispatchEvent("pointercancel");
  stopped = await position(page); await page.clock.runFor(300); expect(await position(page)).toEqual(stopped);
  await page.mouse.up();
  await page.reload(); await page.clock.runFor(100); expect(await position(page)).toEqual(spawn);
});

test("mobile guides, touch hold and reduced motion work", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 900 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  try {
    await context.addInitScript(() => sessionStorage.removeItem("ivector-position-v1"));
    const page = await context.newPage();
    await page.clock.install();
    await page.goto("/virtual-lab/");
    const scene = page.getByRole("group", { name: "Walk around the lab" });
    for (const [index, guide] of guides.entries()) {
      await page.clock.runFor(100); await scene.focus();
      for (const target of routes[index]) await walkTo(page, target);
      const button = scene.getByRole("button", { name: `Talk to ${guide.label} Guide` });
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
      await button.tap(); await expect(page.getByRole("dialog")).toBeVisible();
      if (guide === guides[0]) {
        await page.screenshot({ path: testInfo.outputPath("dialogue-mobile.png"), fullPage: true });
        expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      }
      await page.getByRole("button", { name: "Close", exact: true }).tap();
      await button.tap();
      await page.getByRole("dialog").getByRole("link", { name: `Open ${guide.label}` }).tap();
      await expect(page).toHaveURL(guide.href);
      await page.goto("/virtual-lab/");
    }
    await page.clock.runFor(100);
    await scene.focus();
    for (const target of routes[0]) await walkTo(page, target);
    const prompt = page.getByTestId("talk-prompt");
    await expect(prompt.getByText("Tap guide to talk", { exact: true })).toBeVisible();
    await expect(prompt.getByText("E to talk", { exact: true })).toBeHidden();
    const sceneBox = (await scene.boundingBox())!, promptBox = (await prompt.boundingBox())!;
    expect(promptBox.x).toBeGreaterThanOrEqual(sceneBox.x);
    expect(promptBox.x + promptBox.width).toBeLessThanOrEqual(sceneBox.x + sceneBox.width);
    await scene.screenshot({ path: testInfo.outputPath("nearby-mobile.png") });
    await page.goto("/virtual-lab/"); await page.clock.runFor(100);
    const down = page.getByRole("button", { name: "Move down" });
    await down.scrollIntoViewIfNeeded();
    const box = (await down.boundingBox())!;
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + 22, y: box.y + 22 }] });
    await page.clock.runFor(200);
    await expect.poll(async () => (await position(page)).y).toBeGreaterThan(spawn.y + 2);
    expect(await page.locator("[data-walking] svg path:last-child").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.locator("[data-walking]")).toHaveAttribute("data-walking", "false");
  } finally { await context.close(); }
});

test("all destination links and Home work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const guide of guides) {
      await page.goto("/virtual-lab/");
      await expect(page.getByRole("button", { name: /Talk to/ })).toHaveCount(0);
      await page.getByRole("link", { name: guide.label, exact: true }).click();
      await expect(page).toHaveURL(guide.href);
    }
    await page.goto("/virtual-lab/"); await page.getByRole("link", { name: "Back to Website" }).click();
    await expect(page).toHaveURL("/");
  } finally { await context.close(); }
});
