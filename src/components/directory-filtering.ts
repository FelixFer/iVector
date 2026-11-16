export type Facet = "category" | "year" | "role";
export type FilterRecord = { id: string; category?: string; year?: number; role?: string };
export type Selection = Partial<Record<Facet, string>>;

export function facetOptions(records: readonly FilterRecord[], facet: Facet): string[] {
  const values = [...new Set(records.flatMap(record => record[facet] === undefined ? [] : [String(record[facet])]))];
  return facet === "year" ? values.sort((a, b) => Number(b) - Number(a)) : values.sort((a, b) => a.localeCompare(b));
}

export function matchesFilters(record: FilterRecord, selection: Selection): boolean {
  return (Object.entries(selection) as [Facet, string][]).every(([facet, value]) => !value || String(record[facet] ?? "") === value);
}
