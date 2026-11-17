import { expect, test } from "@playwright/test";
import { recordAnchor, recordHref, relatedRecords, validateRecords, type RecordSnapshot } from "../src/data/records";
import { seedEntries, toPublishedSnapshot, type CmsEntry } from "../cms/model";

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
});

test("relationships reject broken references and encode anchors", () => {
  for (const [relatedIds, message] of [[["missing"], "Unknown related ID"], [["area"], "Self reference"], [[""], "Invalid relatedIds"]] as const) {
    expect(() => validateRecords({ ...fixture, researchAreas: [{ ...fixture.researchAreas[0], relatedIds }] })).toThrow(message);
  }
  expect(() => validateRecords({ ...fixture, people: [{ id: "area", name: "Duplicate", role: "Test" }] })).toThrow("Duplicate content ID");
  const id = "中文 /#% title";
  expect(decodeURIComponent(new URL(recordHref("research", id), "https://example.org").hash.slice(1))).toBe(recordAnchor(id));
});

test("Neon relationships resolve only against the complete published snapshot", () => {
  const entries: CmsEntry[] = seedEntries.map(e => ({ ...e, published: e.draft, publishedOrder: e.order }));
  entries[2] = { ...entries[2], published: { ...entries[2].published, relatedIds: [entries[3].id] } };
  expect(toPublishedSnapshot(entries, []).people[0].relatedIds).toEqual([entries[3].id]);
  expect(() => toPublishedSnapshot(entries.filter(e => e.id !== entries[3].id), [])).toThrow("Unknown related ID");
  entries[2].published = { ...entries[2].published, relatedIds: [entries[2].id] };
  expect(() => toPublishedSnapshot(entries, [])).toThrow("Self reference");
});
