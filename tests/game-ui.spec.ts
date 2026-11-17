import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { dailyBoard, rotate, type Board } from "../game/model";

async function mockDailyPuzzle(page: Page) {
  const board = dailyBoard();
  await page.route("**/today", (route) =>
    route.fulfill({ json: { board, scores: [] } }),
  );
  await page.route("**/start", (route) =>
    route.fulfill({ json: { board, id: "test-round" } }),
  );
}

test("book opens a keyboard accessible puzzle and restores focus", async ({
  page,
}, info) => {
  await mockDailyPuzzle(page);
  await page.addInitScript(() =>
    sessionStorage.setItem(
      "ivector-position-v1",
      JSON.stringify({ version: 1, x: 216, y: 44, facing: "up" }),
    ),
  );
  await page.goto("/virtual-lab/");
  const launcher = page.getByRole("button", {
    name: "Open Light the Lab",
    exact: true,
  });
  await launcher.click();
  const game = page.getByRole("dialog", { name: "Light the Lab", exact: true });
  await expect(game).toBeVisible();
  await game.getByRole("button", { name: "Start puzzle" }).click();
  const tile = game.getByRole("button", { name: /Row 1, column 1/ });
  await tile.click();
  await expect(game.getByText("1 rotation", { exact: true })).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
  ).toEqual([]);
  await page.screenshot({ path: info.outputPath("light-the-lab-desktop.png") });
  await page.keyboard.press("Escape");
  await expect(game).not.toBeVisible();
  await expect(launcher).toBeFocused();
  await launcher.click();
  await expect(game.getByText("1 rotation", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  await expect(game).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
  expect(
    (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
  ).toEqual([]);
  await page.screenshot({ path: info.outputPath("light-the-lab-mobile.png") });
});

test("touch puzzle works in Night with reduced motion", async ({
  browser,
  baseURL,
}, info) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await mockDailyPuzzle(page);
    await page.addInitScript(() =>
      sessionStorage.setItem(
        "ivector-position-v1",
        JSON.stringify({ version: 1, x: 216, y: 44, facing: "up" }),
      ),
    );
    await page.goto("/virtual-lab/");
    await page.getByRole("switch", { name: "Night atmosphere" }).tap();
    await page
      .getByRole("button", { name: "Open Light the Lab", exact: true })
      .tap();
    const game = page.getByRole("dialog", {
      name: "Light the Lab",
      exact: true,
    });
    await expect(game).toBeVisible();
    await game.getByRole("button", { name: "Start puzzle" }).tap();
    await game.getByRole("button", { name: /Row 1, column 1/ }).tap();
    await expect(game.getByText("1 rotation", { exact: true })).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
    ).toEqual([]);
    await page.screenshot({
      path: info.outputPath("light-the-lab-night-mobile.png"),
    });
    await game.getByRole("button", { name: "Close", exact: true }).tap();
    await expect(game).not.toBeVisible();
  } finally {
    await context.close();
  }
});

test("book requires walking into reach and opens with E", async ({ page }) => {
  await mockDailyPuzzle(page);
  await page.goto("/virtual-lab/");
  const book = page.getByRole("button", {
    name: "Open Light the Lab",
    exact: true,
  });
  await expect(book).toHaveAttribute("aria-disabled", "true");
  await book.click({ force: true });
  await expect(
    page.getByRole("dialog", { name: "Light the Lab" }),
  ).not.toBeVisible();
  await page.addInitScript(() =>
    sessionStorage.setItem(
      "ivector-position-v1",
      JSON.stringify({ version: 1, x: 216, y: 44, facing: "up" }),
    ),
  );
  await page.reload();
  await expect(book).toHaveAttribute("aria-disabled", "false");
  await page.getByRole("group", { name: "Walk around the lab" }).focus();
  await page.keyboard.press("e");
  await expect(
    page.getByRole("dialog", { name: "Light the Lab" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("group", { name: "Walk around the lab" }),
  ).toBeFocused();
});

function solutionFor(board: Board) {
  const paths: number[][] = [];
  function walk(path: number[]) {
    const last = path.at(-1)!;
    if (last === board.sink) {
      paths.push(path);
      return;
    }
    for (const next of [last - 4, last + 1, last + 4, last - 1])
      if (
        next >= 0 &&
        next < 16 &&
        !path.includes(next) &&
        Math.abs((next % 4) - (last % 4)) +
          Math.abs(Math.floor(next / 4) - Math.floor(last / 4)) ===
          1
      )
        walk([...path, next]);
  }
  walk([board.source]);
  let solution: number[] | undefined;
  for (const path of paths) {
    const moves: number[] = [];
    let valid = true;
    for (let i = 0; i < path.length; i++) {
      const cell = path[i],
        before = i ? path[i - 1] : -1,
        after = i < path.length - 1 ? path[i + 1] : 16;
      const bit = (n: number) =>
        n === -1
          ? board.sourceBit
          : n === 16
            ? board.sinkBit
            : n === cell - 4
              ? 1
              : n === cell + 1
                ? 2
                : n === cell + 4
                  ? 4
                  : 8;
      const required = bit(before) | bit(after);
      let mask = board.tiles[cell],
        turn = 0;
      while ((mask & required) !== required && turn < 4) {
        mask = rotate(mask);
        turn++;
      }
      if (turn === 4) {
        valid = false;
        break;
      }
      moves.push(...Array(turn).fill(cell));
    }
    if (valid && (!solution || moves.length < solution.length))
      solution = moves;
  }

  return solution!;
}

for (const eligible of [true, false])
  test(`winning locks the board and nickname eligibility is ${eligible}`, async ({
    page,
  }, info) => {
    const board = dailyBoard("2026-11-01");
    if (!eligible) await page.setViewportSize({ width: 320, height: 740 });
    await page.clock.setFixedTime(new Date("2026-11-01T04:00:00Z"));
    await page.route("**/today", (route) =>
      route.fulfill({ json: { board, scores: [] } }),
    );
    let ranked = false;
    await page.route("**/start", (route) => {
      ranked = true;
      return route.fulfill({ json: { id: "test-round", board } });
    });
    let finishAttempts = 0;
    await page.route("**/finish", (route) =>
      eligible && finishAttempts++ === 0
        ? route.fulfill({
            status: 503,
            json: { error: "Temporary verification failure" },
          })
        : route.fulfill({
            json: { seconds: 12, eligible, rank: eligible ? 1 : 6, scores: [] },
          }),
    );
    await page.addInitScript(() =>
      sessionStorage.setItem(
        "ivector-position-v1",
        JSON.stringify({ version: 1, x: 216, y: 44, facing: "up" }),
      ),
    );
    await page.goto("/virtual-lab/");
    await page
      .getByRole("button", { name: "Open Light the Lab", exact: true })
      .click();
    const game = page.getByRole("dialog", {
      name: "Light the Lab",
      exact: true,
    });
    await game.getByRole("button", { name: "Start puzzle" }).click();
    const tiles = game.locator("button[data-powered]");
    const solution = solutionFor(board);
    for (const index of solution) await tiles.nth(index).click();
    await expect(
      game.getByRole("heading", { name: "Lamp lit!", exact: true }),
    ).toBeFocused();
    for (const tile of await tiles.all()) await expect(tile).toBeDisabled();
    if (!ranked)
      await expect(game.getByText(/unranked practice/i)).toBeVisible();
    if (eligible && ranked)
      await game.getByRole("button", { name: "Retry verification" }).click();
    const nickname = game.getByRole("textbox", { name: "Nickname" });
    await expect(nickname).toHaveCount(eligible && ranked ? 1 : 0);
    await expect(game.getByText(/Lamp lit!/i)).toHaveCount(1);
    const result = game.getByRole("region", { name: "Lamp lit!" });
    await expect(result).toContainText(new RegExp(`${solution.length} rotations`));
    if (ranked) await expect(result).toContainText("12 seconds");
    if (!eligible)
      await expect(result.getByRole("button", { name: "Play again" })).toBeInViewport({ ratio: 1 });
    if (eligible && ranked) {
      await nickname.fill("Test");
      await expect(nickname).toBeVisible();
      expect((await nickname.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(
        (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
      ).toEqual([]);
      const boardBox = (await tiles.nth(3).boundingBox())!;
      expect((await nickname.boundingBox())!.x).toBeGreaterThan(
        boardBox.x + boardBox.width,
      );
      await game.screenshot({ path: info.outputPath("result-desktop.png") });
    }
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Open Light the Lab", exact: true })
      .click();
    await expect(tiles.first()).toBeDisabled();
    await page.setViewportSize({ width: 320, height: 740 });
    await game.getByRole("tab", { name: "Top 5", exact: true }).click();
    await expect(
      game.getByRole("heading", { name: "Today’s Top 5" }),
    ).toBeVisible();
    await game.getByRole("tab", { name: "Game", exact: true }).click();
    await expect(tiles.first()).toBeDisabled();
    if (eligible && ranked) {
      await expect(nickname).toHaveValue("Test");
      await page.route("**/submit", (route) =>
        route.fulfill({
          json: {
            accepted: true,
            rank: 1,
            scores: [
              {
                id: "test-round",
                nickname: "Test",
                moves: solution.length,
                seconds: 12,
                rank: 1,
              },
            ],
          },
        }),
      );
      await expect(game.getByRole("button", { name: "Play again" })).toBeInViewport({ ratio: 1 });
      await expect(game.getByRole("button", { name: "Submit score" })).toBeInViewport({ ratio: 1 });
      await game.screenshot({ path: info.outputPath("result-mobile.png") });
      await game.getByRole("button", { name: "Submit score" }).click();
      await expect(
        game.getByRole("tab", { name: "Top 5", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(game.locator('tr[data-own="true"]')).toContainText("Test");
      await expect(game.getByRole("status").filter({ hasText: /posted/i })).toBeVisible();
      await expect(game.getByRole("tab", { name: "Top 5", exact: true })).toBeFocused();
      expect(
        (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
      ).toEqual([]);
      await game.screenshot({ path: info.outputPath("posted-mobile.png") });
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(result).toBeVisible();
      await expect(tiles.first()).toBeDisabled();
      await expect(game.getByRole("button", { name: "Play again" })).toBeVisible();
      await game.screenshot({ path: info.outputPath("posted-desktop.png") });
    }
  });

test("workbench fits responsive widths with the score panel on the right", async ({
  page,
}, info) => {
  await mockDailyPuzzle(page);
  await page.addInitScript(() =>
    sessionStorage.setItem(
      "ivector-position-v1",
      JSON.stringify({ version: 1, x: 216, y: 44, facing: "up" }),
    ),
  );
  for (const night of [false, true])
    for (const width of [320, 767, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/virtual-lab/");
      const toggle = page.getByRole("switch", { name: "Night atmosphere" });
      if ((await toggle.getAttribute("aria-checked")) !== String(night))
        await toggle.click();
      await page
        .getByRole("button", { name: "Open Light the Lab", exact: true })
        .click();
      const game = page.getByRole("dialog", {
        name: "Light the Lab",
        exact: true,
      });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      expect(await game.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      const firstTile = (await game.locator("button[data-powered]").first().boundingBox())!;
      expect(firstTile.width).toBeGreaterThanOrEqual(44);
      expect(firstTile.height).toBeGreaterThanOrEqual(44);
      if (width >= 768) {
        const boardRight = (await game.locator("button[data-powered]").nth(3).boundingBox())!;
        const scores = (await game.locator("#panel-scores").boundingBox())!;
        expect(scores.x).toBeGreaterThan(boardRight.x + boardRight.width);
        await expect(
          game.getByRole("heading", { name: "Today’s Top 5" }),
        ).toBeVisible();
      } else {
        await game.getByRole("tab", { name: "Top 5", exact: true }).click();
        await expect(
          game.getByRole("heading", { name: "Today’s Top 5" }),
        ).toBeVisible();
        await page.keyboard.press("ArrowLeft");
        await expect(
          game.getByRole("tab", { name: "Game", exact: true }),
        ).toBeFocused();
      }
      expect(
        (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
      ).toEqual([]);
      if (width === 320 || width === 1280)
        await page.screenshot({
          path: info.outputPath(
            `workbench-${night ? "night" : "day"}-${width}.png`,
          ),
        });
    }
});
