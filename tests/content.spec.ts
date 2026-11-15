import { expect, test } from "@playwright/test";
import { decodeContentful, loadContent } from "../src/data/load-content";
import { people } from "../src/data/content";

test("member seed preserves owner-supplied order, IDs, nationalities and emails", () => {
  expect(people.slice(1).map(p => [p.name, p.studentId, p.nationality, p.email])).toEqual([
    ["Felix Ferdinand", "611521418", "Indonesia", "611521418@gms.ndhu.edu.tw"],
    ["李彥龍", "611521207", "Taiwan", "611521207@gms.ndhu.edu.tw"],
    ["邱柏誠", "611521212", "Taiwan", "611521212@gms.ndhu.edu.tw"],
    ["Vo Cong Vinh", "611421316", "Vietnam", "611421316@gms.ndhu.edu.tw"],
  ]);
  expect(people.slice(1).every(p => p.role === "Master’s Students" && p.initials)).toBe(true);
});

test("CMS maps published records and rejects malformed data", () => {
  const entry = { sys: { id: "student", contentType: { sys: { id: "person" } } }, fields: { name: "Felix Ferdinand", role: "Master’s Students", email: "611521418@gms.ndhu.edu.tw", studentId: "611521418" } };
  expect(decodeContentful([entry]).people[0].email).toBe(entry.fields.email);
  expect(() => decodeContentful([{ ...entry, fields: { ...entry.fields, email: "invalid" } }])).toThrow("Invalid email");
  expect(() => decodeContentful([entry, entry])).toThrow("Duplicate content ID");
  expect(() => decodeContentful([{ ...entry, fields: { name: "Felix Ferdinand" } }])).toThrow("role");
  expect(() => decodeContentful([{ ...entry, fields: { ...entry.fields, photo: { sys: { id: "missing" } } } }])).toThrow("image asset");
  const photoEntry = { ...entry, fields: { ...entry.fields, photo: { sys: { id: "portrait" } }, photoAlt: "Felix Ferdinand", photoSource: "https://example.org/portrait", photoPermission: "Owner supplied" } };
  const assets = [{ sys: { id: "portrait" }, fields: { file: { url: "//images.ctfassets.net/portrait.jpg", details: { image: { width: 200, height: 200 } } } } }];
  expect(decodeContentful([photoEntry], assets).people[0].photo).toEqual({ src: "https://images.ctfassets.net/portrait.jpg", alt: "Felix Ferdinand", width: 200, height: 200 });
});

test("partial CMS credentials fail rather than falling back", async () => {
  const previous = { ...process.env };
  try {
    process.env.CONTENTFUL_SPACE_ID = "incomplete";
    delete process.env.CONTENTFUL_DELIVERY_TOKEN; delete process.env.CONTENTFUL_ENVIRONMENT;
    await expect(loadContent()).rejects.toThrow("Set all Contentful");
  } finally { process.env = previous; }
});

test("People portraits and member emails are accessible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/people/");
  await expect(page.getByRole("heading", { name: "Master’s Students", exact: true })).toBeVisible();
  for (const person of people.slice(1)) {
    await expect(page.getByRole("heading", { name: person.name, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: person.email, exact: true })).toHaveAttribute("href", `mailto:${person.email}`);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
