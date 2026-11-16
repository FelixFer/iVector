import type { Person, Project, Publication, ResearchArea } from "./content";

export type RecordKind = "research" | "projects" | "people" | "publications";
export type RecordSnapshot = {
  researchAreas: readonly ResearchArea[];
  projects: readonly Project[];
  people: readonly Person[];
  publications: readonly Publication[];
};

const groups = [
  ["researchAreas", "research", "Related research"],
  ["projects", "projects", "Related projects"],
  ["people", "people", "Related members"],
  ["publications", "publications", "Related publications"],
] as const;

export function recordAnchor(id: string): string {
  return `record-${encodeURIComponent(id)}`;
}

export function recordHref(kind: RecordKind, id: string): string {
  return `/${kind}/#${encodeURIComponent(recordAnchor(id))}`;
}

export function validateRecords(snapshot: RecordSnapshot): void {
  const records = groups.flatMap(([key]) => [...snapshot[key]]);
  const ids = new Set<string>();
  for (const record of records) {
    if (typeof record.id !== "string" || !record.id.trim()) throw new Error("Invalid content ID");
    if (ids.has(record.id)) throw new Error(`Duplicate content ID: ${record.id}`);
    ids.add(record.id);
  }
  for (const record of records) {
    if (record.relatedIds === undefined) continue;
    if (!Array.isArray(record.relatedIds) || record.relatedIds.some(id => typeof id !== "string" || !id.trim())) throw new Error(`Invalid relatedIds: ${record.id}`);
    for (const id of record.relatedIds) {
      if (id === record.id) throw new Error(`Self reference: ${record.id}`);
      if (!ids.has(id)) throw new Error(`Unknown related ID: ${id}`);
    }
  }
}

export function relatedRecords(snapshot: RecordSnapshot, id: string) {
  const source = groups.flatMap(([key]) => [...snapshot[key]]).find(record => record.id === id);
  return groups.map(([key, kind, label]) => ({
    label,
    records: snapshot[key]
      .filter(record => record.id !== id && (source?.relatedIds?.includes(record.id) || record.relatedIds?.includes(id)))
      .map(record => ({ id: record.id, label: "name" in record ? record.name : record.title, href: recordHref(kind, record.id) })),
  })).filter(group => group.records.length);
}
