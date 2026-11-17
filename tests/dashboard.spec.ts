import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedEntries, type CmsEntry } from "../cms/model";

test("dashboard exports no draft data and explains missing activation", async ({ page, request }) => {
  await page.goto("/dashboard/");
  await expect(page.getByRole("heading", { name: "Staff dashboard", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const html = await (await request.get("/dashboard/")).text();
  expect(html).not.toContain("sourceNote");
  expect(html).not.toContain("publishedOrder");
  if (await page.getByRole("button", { name: "Sign in", exact: true }).isDisabled()) {
    await expect(page.getByText("Staff sign-in is not connected yet.", { exact: false })).toBeVisible();
    await expect(page.getByLabel("Username", { exact: true })).toBeDisabled();
    await expect(page.getByLabel("Password", { exact: true })).toBeDisabled();
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("dashboard login fits narrow screens and both themes", async ({ page }) => {
  for (const width of [320, 767, 768, 896, 1152, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dashboard/");
    for (const theme of ["day", "night"]) {
      await page.evaluate(value => document.documentElement.dataset.atmosphere = value, theme);
      await expect(page.getByRole("heading", { name: "Staff dashboard", exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
});

const mocked = process.env.CMS_UI_MOCK === "1";

async function mockCMS(page: Page) {
  let signedIn = false;
  const state = { entries: structuredClone(seedEntries), failSave: false, expired: false, recoveryRequested: false, reset: false };
  const origin = "http://127.0.0.1:4173";
  const headers = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", "Access-Control-Expose-Headers": "set-auth-jwt", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS" };
  const payload = Buffer.from(JSON.stringify({ sub: "fixture-owner", exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  const token = `${Buffer.from('{"alg":"EdDSA"}').toString("base64url")}.${payload}.fixture`;
  const user = { id: "fixture-owner", name: "iVector", email: "611521418@gms.ndhu.edu.tw", emailVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const session = { id: "fixture-session", userId: user.id, token, expiresAt: new Date(Date.now() + 3600_000).toISOString(), createdAt: user.createdAt, updatedAt: user.updatedAt };
  await page.route("https://cms-auth.example.test/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    if (path.endsWith("/sign-in/email")) {
      if (route.request().postDataJSON().password === "incorrect-fixture-password") return route.fulfill({ status: 401, headers, json: { message: "Invalid credentials", code: "INVALID_EMAIL_OR_PASSWORD" } });
      signedIn = true;
      return route.fulfill({ headers, json: { user, token, redirect: false } });
    }
    if (path.endsWith("/sign-out")) { signedIn = false; return route.fulfill({ headers, json: { success: true } }); }
    if (path.endsWith("/request-password-reset")) { state.recoveryRequested = true; return route.fulfill({ headers, json: { status: true } }); }
    if (path.endsWith("/reset-password")) { state.reset = true; return route.fulfill({ headers, json: { status: true } }); }
    return route.fulfill({ headers: { ...headers, "set-auth-jwt": token }, json: signedIn ? { session, user } : null });
  });
  await page.route("https://cms-api.example.test/**", async route => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers });
    if (!signedIn || state.expired) return route.fulfill({ status: 401, headers, json: { error: "Unauthorized" } });
    if (path === "/entries" && method === "GET") return route.fulfill({ headers, json: { entries: state.entries, assets: [] } });
    if (state.failSave) return route.fulfill({ status: 409, headers, json: { error: "The record changed. Reload the saved version before trying again." } });
    const body = route.request().postDataJSON();
    if (method === "POST" && path === "/entries") {
      const entry: CmsEntry = { ...body, revision: 1, published: null, publishedOrder: null, updatedAt: new Date().toISOString() };
      state.entries.push(entry);
      return route.fulfill({ status: 201, headers, json: { entry } });
    }
    const id = decodeURIComponent(path.split("/")[2]);
    const entry = state.entries.find(item => item.id === id)!;
    if (method === "DELETE") { state.entries = state.entries.filter(item => item.id !== id); return route.fulfill({ headers, json: { deleted: true } }); }
    if (path.endsWith("/publish")) { entry.published = structuredClone(entry.draft); entry.publishedOrder = entry.order; }
    else if (path.endsWith("/unpublish")) { entry.published = null; entry.publishedOrder = null; }
    else Object.assign(entry, body);
    entry.revision += 1;
    return route.fulfill({ headers, json: { entry } });
  });
  return state;
}

async function login(page: Page) {
  await page.goto("/dashboard/");
  await page.getByLabel("Password", { exact: true }).fill("fixture-only-password-not-live");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Signed in as", { exact: false })).toBeVisible();
}

test.describe("configured dashboard with mocked services", () => {
  test.skip(!mocked, "Run with CMS_UI_MOCK=1 and the documented mock-service build URLs.");

  test("rejects incorrect credentials, then supports editing and logout", async ({ page }) => {
    await mockCMS(page);
    await page.goto("/dashboard/");
    await page.getByLabel("Password", { exact: true }).fill("incorrect-fixture-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.locator('main [role="alert"]')).toContainText(/Sign-in failed|Invalid email or password/);
    await login(page);
    await expect(page.getByRole("textbox", { name: "Introduction", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Staff sign-in", exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Content sections" })).toHaveCount(0);
  });

  test("covers all six editors and preserves fields on revision failure", async ({ page }) => {
    const state = await mockCMS(page);
    await login(page);
    await page.getByRole("button", { name: "About", exact: true }).click();
    await expect(page.getByLabel("Research approach", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "People", exact: true }).click();
    await expect(page.getByLabel("Nationality", { exact: true })).toBeVisible();
    await page.getByLabel("Name", { exact: true }).fill("Edited draft name");
    state.failSave = true;
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.locator('main [role="alert"]')).toContainText("record changed");
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Edited draft name");
    state.failSave = false;
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Draft saved");
    for (const [section, expected] of [["Research", "Description"], ["Projects", "Demo URL"], ["Publications", "Authors, in citation order"]]) {
      await page.getByRole("button", { name: section, exact: true }).click();
      await page.getByRole("button", { name: "Add record", exact: true }).click();
      await expect(page.getByLabel(expected, { exact: true })).toBeVisible();
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });

  test("publishes saved drafts and keeps record IDs permanent", async ({ page }) => {
    const state = await mockCMS(page);
    await login(page);
    await page.getByRole("button", { name: "People", exact: true }).click();
    await expect(page.getByLabel("Record ID", { exact: true })).toHaveAttribute("readonly", "");
    await page.getByLabel("Research interests", { exact: true }).fill("Draft-only fixture text");
    await expect(page.getByRole("button", { name: "Publish saved draft" })).toBeDisabled();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Draft saved");
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Publish saved draft" }).click();
    await expect(page.getByRole("status")).toContainText("current website has not changed");
    expect(state.entries.find(entry => entry.id === "yu-chieh-ho")?.published?.interests).toBe("Draft-only fixture text");
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Unpublish", exact: true }).click();
    await expect(page.getByRole("button", { name: "Delete draft", exact: true })).toBeVisible();
  });

  test("announces session expiry without exposing editor content", async ({ page }) => {
    const state = await mockCMS(page);
    await login(page);
    await page.getByRole("textbox", { name: "Introduction", exact: true }).fill("Unsaved fixture copy");
    state.expired = true;
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.locator('main [role="alert"]')).toContainText("session expired");
    await expect(page.getByRole("heading", { name: "Staff sign-in", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Introduction", exact: true })).toHaveCount(0);
    state.expired = false;
    await page.getByLabel("Password", { exact: true }).fill("fixture-only-password-not-live");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Introduction", exact: true })).toHaveValue("Unsaved fixture copy");
  });

  test("requests recovery and accepts a reset token", async ({ page }) => {
    const state = await mockCMS(page);
    await page.goto("/dashboard/");
    await page.getByRole("button", { name: "Send recovery email", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Recovery email requested");
    expect(state.recoveryRequested).toBe(true);
    await page.goto("/dashboard/?token=fixture-reset-token");
    await page.getByLabel("New password", { exact: true }).fill("replacement-fixture-password");
    await page.getByLabel("Confirm new password", { exact: true }).fill("replacement-fixture-password");
    await page.getByRole("button", { name: "Set password", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Password updated");
    expect(state.reset).toBe(true);
    expect(page.url()).not.toContain("token=");
  });
});



