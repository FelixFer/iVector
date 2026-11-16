import { expect, test } from "@playwright/test";
import { facetOptions, matchesFilters } from "../src/components/directory-filtering";
import { recordAnchor } from "../src/data/records";

test("facets use supplied values and combine category, year and role", () => {
  const records = [
    { id: "fixture-a", category: "Fixture A", year: 2025, role: "Fixture role" },
    { id: "fixture-b", category: "Fixture B", year: 2026 },
    { id: "fixture-c", category: "Fixture A", year: 2026 },
    { id: "fixture-d" },
  ];
  expect(facetOptions([], "year")).toEqual([]);
  expect(facetOptions(records, "year")).toEqual(["2026", "2025"]);
  expect(facetOptions(records, "category")).toEqual(["Fixture A", "Fixture B"]);
  expect(facetOptions(records, "role")).toEqual(["Fixture role"]);
  expect(records.filter(record => matchesFilters(record, { category: "Fixture A", year: "2026" })).map(record => record.id)).toEqual(["fixture-c"]);
  expect(records.filter(record => matchesFilters(record, { category: "Fixture B", year: "2025" }))).toEqual([]);
  expect(records.filter(record => matchesFilters(record, {}))).toHaveLength(4);
  expect(matchesFilters(records[3], { role: "Fixture role" })).toBe(false);
});

test("People role filtering hides empty groups, resets and keeps control focus", async ({ page }) => {
  await page.goto("/people/");
  const filter = page.getByRole("combobox", { name: "Role", exact: true });
  await expect(filter).toBeVisible();
  await filter.focus();
  await filter.selectOption("Assistant Professor");
  await expect(filter).toBeFocused();
  await expect(page.getByRole("heading", { name: "Master’s Students", exact: true })).toBeHidden();
  await expect(page.locator("[data-record]:visible")).toHaveCount(1);
  await expect(page.getByRole("group", { name: "Directory filters" }).getByRole("status")).toHaveText("1 of 5 records");
  await page.getByRole("button", { name: "Reset filters", exact: true }).click();
  await expect(page.locator("[data-record]:visible")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "Master’s Students", exact: true })).toBeVisible();
});

test("incoming anchors reveal a filtered record and focus it", async ({ page }) => {
  await page.goto("/people/");
  await page.getByRole("combobox", { name: "Role", exact: true }).selectOption("Assistant Professor");
  const anchor = recordAnchor("611521418");
  await page.evaluate(hash => { location.hash = hash; }, encodeURIComponent(anchor));
  await expect(page.getByRole("combobox", { name: "Role", exact: true })).toHaveValue("");
  await expect(page.locator(`[id="${anchor}"]`)).toBeFocused();
  await expect(page.locator(`[id="${anchor}"]`)).toBeVisible();
  await page.getByRole("combobox", { name: "Role", exact: true }).selectOption("Assistant Professor");
  await page.evaluate(() => {
    const link = document.createElement("a");
    link.href = location.hash; link.textContent = "Revisit member"; document.body.append(link);
  });
  await page.getByRole("link", { name: "Revisit member", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Role", exact: true })).toHaveValue("");
  await expect(page.locator(`[id="${anchor}"]`)).toBeFocused();
  await page.reload();
  await expect(page.locator(`[id="${anchor}"]`)).toBeVisible();
});

test("empty directories have no filter controls", async ({ page }) => {
  for (const route of ["research", "projects", "publications"]) {
    await page.goto(`/${route}/`);
    await expect(page.getByRole("group", { name: "Directory filters" })).toHaveCount(0);
    await expect(page.getByText(/^No .+ listed\.$/)).toBeVisible();
  }
});

test("without JavaScript People retains every record and working anchors", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto(`/people/#${encodeURIComponent(recordAnchor("611521418"))}`);
    await expect(page.locator("[data-record]:visible")).toHaveCount(5);
    await expect(page.getByRole("group", { name: "Directory filters" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "611521418@gms.ndhu.edu.tw", exact: true })).toHaveAttribute("href", "mailto:611521418@gms.ndhu.edu.tw");
  } finally { await context.close(); }
});
