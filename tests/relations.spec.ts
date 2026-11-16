import { expect, test } from "@playwright/test";
import { decodeContentful } from "../src/data/load-content";
import { recordAnchor, recordHref, relatedRecords, validateRecords, type RecordSnapshot } from "../src/data/records";
import { ensureRelatedField, relatedField } from "../scripts/contentful-relations.mjs";

const fixture: RecordSnapshot = {
  researchAreas: [{ id: "area", title: "Fixture area", description: "Test only", relatedIds: ["project", "project"] }],
  projects: [{ id: "project", title: "Fixture project", description: "Test only", relatedIds: ["person"] }],
  people: [{ id: "person", name: "Fixture member", role: "Test role" }],
  publications: [{ id: "paper", title: "Fixture paper", authors: ["Fixture member"], venue: "Test venue", year: 2025 }],
};

test("explicit relations are symmetric, deduplicated, and never inferred", () => {
  validateRecords(fixture);
  expect(relatedRecords(fixture, "area")).toEqual([{ label: "Related projects", records: [{ id: "project", label: "Fixture project", href: recordHref("projects", "project") }] }]);
  expect(relatedRecords(fixture, "project").flatMap(group => group.records.map(record => record.id))).toEqual(["area", "person"]);
  expect(relatedRecords(fixture, "person").flatMap(group => group.records.map(record => record.id))).toEqual(["project"]);
  expect(relatedRecords(fixture, "paper")).toEqual([]);
  expect(relatedRecords({ ...fixture, researchAreas: [] }, "paper")).toEqual([]);
});

test("relationships reject broken references and use encoding-safe record anchors", () => {
  for (const [relatedIds, message] of [[["missing"], "Unknown related ID"], [["area"], "Self reference"], [[""], "Invalid relatedIds"]] as const) {
    expect(() => validateRecords({ ...fixture, researchAreas: [{ ...fixture.researchAreas[0], relatedIds }] })).toThrow(message);
  }
  expect(() => validateRecords({ ...fixture, people: [{ id: "area", name: "Duplicate", role: "Test" }] })).toThrow("Duplicate content ID");
  const id = "中文 /#% title";
  const href = recordHref("research", id);
  expect(decodeURIComponent(new URL(href, "https://example.org").hash.slice(1))).toBe(recordAnchor(id));
  expect(recordAnchor(id)).not.toMatch(/\s/);
});

test("CMS accepts optional references and validates after the full snapshot", () => {
  const member = { sys: { id: "member", contentType: { sys: { id: "person" } } }, fields: { name: "Fixture member", role: "Test role" } };
  const project = { sys: { id: "project", contentType: { sys: { id: "project" } } }, fields: { title: "Fixture project", description: "Test only", relatedIds: ["member", "member"] } };
  expect(decodeContentful([project, member]).projects[0].relatedIds).toEqual(["member"]);
  expect(decodeContentful([member]).people[0].relatedIds).toBeUndefined();
  expect(() => decodeContentful([project])).toThrow("Unknown related ID");
  expect(() => decodeContentful([{ ...project, fields: { ...project.fields, relatedIds: "member" } }, member])).toThrow("Invalid relatedIds");
  expect(() => decodeContentful([{ ...project, fields: { ...project.fields, relatedIds: [7] } }, member])).toThrow("relatedIds");
});

test("CMS relationship schema update is additive, versioned, and safe to rerun", async () => {
  const original = { id: "custom", name: "Custom field", type: "Symbol", validations: [{ size: { min: 2 } }] };
  let model = { name: "Existing name", description: "Keep description", displayField: "custom", fields: [original], sys: { version: 4, publishedVersion: 3 } };
  const writes: { path: string; init: RequestInit }[] = [];
  const fetcher = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const path = String(input);
    if (!init.method) return Response.json(model);
    writes.push({ path, init });
    if (path.endsWith("/published")) { model.sys = { version: 6, publishedVersion: 5 }; return Response.json(model); }
    const payload = JSON.parse(String(init.body));
    model = { ...model, ...payload, sys: { version: 5, publishedVersion: 3 } };
    return Response.json(model);
  };
  await ensureRelatedField("https://example.org", "person", "test-token", fetcher);
  expect(model.fields).toEqual([original, relatedField]);
  expect(model.name).toBe("Existing name");
  expect(model.description).toBe("Keep description");
  expect(model.displayField).toBe("custom");
  expect(new Headers(writes[0].init.headers).get("X-Contentful-Version")).toBe("4");
  expect(new Headers(writes[1].init.headers).get("X-Contentful-Version")).toBe("5");
  await ensureRelatedField("https://example.org", "person", "test-token", fetcher);
  expect(writes).toHaveLength(2);
});

test("CMS schema conflicts reread current fields and pending edits are not activated", async () => {
  let reads = 0, writes = 0;
  const fetcher = async (_input: RequestInfo | URL, init: RequestInit = {}) => {
    if (!init.method) {
      reads++;
      return Response.json({ name: "Test", displayField: "title", fields: [{ id: "title", type: "Symbol" }, ...(reads > 1 ? [{ id: "editorField", type: "Symbol" }] : [])], sys: { version: reads > 1 ? 6 : 4, publishedVersion: reads > 1 ? 5 : 3 } });
    }
    if (String(_input).endsWith("/published")) return Response.json({});
    writes++;
    if (writes === 1) return new Response(null, { status: 409 });
    expect(JSON.parse(String(init.body)).fields.map((field: { id: string }) => field.id)).toEqual(["title", "editorField", "relatedIds"]);
    expect(new Headers(init.headers).get("X-Contentful-Version")).toBe("6");
    return Response.json({ sys: { version: 7 } });
  };
  await ensureRelatedField("https://example.org", "project", "test-token", fetcher);
  expect(reads).toBe(2);
  expect(writes).toBe(2);
  const pending = async () => Response.json({ fields: [], sys: { version: 5, publishedVersion: 3 } });
  await expect(ensureRelatedField("https://example.org", "project", "test-token", pending)).rejects.toThrow("pending schema changes");
});
