import { expect, test } from "@playwright/test";
import { loadContent } from "../src/data/load-content";
import { people } from "../src/data/content";
import { decodePublished, seedEntries, toPublishedSnapshot, validateDraft, validatePublish, validateSnapshot, type CmsAsset, type CmsEntry } from "../cms/model";

const approved = (): CmsEntry[] => seedEntries.map(e => ({ ...e, published: e.draft, publishedOrder: e.order }));

test("member seed preserves owner-supplied identity and order", () => {
  expect(people.slice(1).map(p => [p.name, p.studentId, p.nationality, p.email])).toEqual([
    ["Felix Ferdinand", "611521418", "Indonesia", "611521418@gms.ndhu.edu.tw"],
    ["李彥龍", "611521207", "Taiwan", "611521207@gms.ndhu.edu.tw"],
    ["邱柏誠", "611521212", "Taiwan", "611521212@gms.ndhu.edu.tw"],
    ["Vo Cong Vinh", "611421316", "Vietnam", "611421316@gms.ndhu.edu.tw"],
  ]);
  expect(toPublishedSnapshot(approved(), []).people.map(p => p.id)).toEqual(people.map(p => p.id));
});

test("draft edits and ordering never change published content", () => {
  const entries = approved();
  entries[2] = { ...entries[2], draft: { name: "Unsaved fixture" }, order: 999 };
  const snapshot = toPublishedSnapshot(entries, []);
  expect(snapshot.people[0].name).toBe("Yu-Chieh Ho");
  expect(JSON.stringify(snapshot)).not.toMatch(/Unsaved fixture|sourceNote|source_note|revision|photoPermission/);
  expect(() => toPublishedSnapshot(entries.filter(e => e.kind !== "home"), [])).toThrow("Home and About");
  expect(validateSnapshot(JSON.parse(JSON.stringify(snapshot)))).toEqual(snapshot);
});

test("CMS validates fields at trust boundaries and requires verified publication", () => {
  expect(() => validateDraft("person", { name: "Fixture", role: "Fixture", email: "invalid" })).toThrow("email");
  expect(() => validateDraft("person", { studentId: "abc" })).toThrow("Student ID");
  expect(() => validateDraft("project", { codeUrl: "javascript:alert(1)" })).toThrow("HTTP");
  expect(() => validateDraft("project", { codeUrl: "https://user:password@example.test" })).toThrow("credentials");
  expect(() => validateDraft("home", { unknown: "private" })).toThrow("Unsupported field");
  expect(() => validateDraft("publication", { year: 1.5 })).toThrow("year");
  expect(() => validatePublish({ ...approved()[0], sourceNote: "" })).toThrow("Verified source");
  expect(() => validatePublish({ ...approved()[0], draft: {} })).toThrow("text");
  const records = approved().map(e => ({ id: e.id, kind: e.kind, fields: e.published!, order: e.order }));
  expect(() => decodePublished([...records, records[0]], [])).toThrow("Duplicate");
});

test("published images accept owner provenance and become portable assets", () => {
  const entries = approved();
  const asset: CmsAsset = { id: "portrait", key: "private/portrait.webp", mime: "image/webp", width: 200, height: 200, size: 50, sha256: "a".repeat(64) };
  const fields = { ...entries[2].draft, photoId: asset.id, photoAlt: "Test portrait", photoSource: "Owner supplied photograph", photoPermission: "Owner permission" };
  entries[2] = { ...entries[2], draft: fields, published: fields };
  expect(() => toPublishedSnapshot(entries, [])).toThrow("image");
  const snapshot = toPublishedSnapshot(entries, [asset]);
  expect(snapshot.people[0].photo?.src).toBe(`/cms-assets/${asset.sha256}.webp`);
  expect(JSON.stringify(snapshot)).not.toContain("Owner permission");
  expect(validateSnapshot(JSON.parse(JSON.stringify(snapshot))).people[0].photo).toEqual(snapshot.people[0].photo);
  entries[2].published = { ...fields, photoPermission: "" };
  expect(() => toPublishedSnapshot(entries, [asset])).toThrow("permission");
});

test("normal builds ignore remote credentials and explicit invalid sources fail", async () => {
  const previous = process.env.CMS_CONTENT_SOURCE;
  try {
    process.env.CMS_CONTENT_SOURCE = "local";
    expect((await loadContent()).people).toEqual(people);
    process.env.CMS_CONTENT_SOURCE = "invalid";
    await expect(loadContent()).rejects.toThrow("local or neon");
  } finally {
    if (previous === undefined) delete process.env.CMS_CONTENT_SOURCE;
    else process.env.CMS_CONTENT_SOURCE = previous;
  }
});

test("People portraits and member emails are accessible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 }); await page.goto("/people/");
  for (const person of people.slice(1)) {
    await expect(page.getByRole("heading", { name: person.name, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: person.email, exact: true })).toHaveAttribute("href", `mailto:${person.email}`);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
