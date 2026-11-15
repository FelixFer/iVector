import { cache } from "react";
import * as local from "./content";

type Snapshot = { -readonly [K in "homeIntroduction" | "about" | "researchAreas" | "projects" | "people" | "publications"]: (typeof local)[K] };
type Entry = { sys: { id: string; contentType?: { sys: { id: string } } }; fields: Record<string, unknown> };
export function decodeContentful(entries: Entry[], assets: Entry[] = []): Snapshot {
  const result: Snapshot = { homeIntroduction: {}, about: {}, researchAreas: [], projects: [], people: [], publications: [] };
  const text = (value: unknown, name: string, required = false): string | undefined => {
    if (value === undefined && !required) return undefined;
    if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid content field: ${name}`);
    return value;
  };
  const url = (value: unknown): local.Resource["href"] => {
    if (typeof value !== "string" || !/^https?:\/\//.test(value)) throw new Error("Invalid content URL");
    new URL(value); return value as local.Resource["href"];
  };
  const photo = (fields: Record<string, unknown>, key: string): local.Photo | undefined => {
    if (!fields[key]) return undefined;
    const ref = fields[key] as { sys?: { id?: string } };
    const asset = assets.find(a => a.sys.id === ref.sys?.id);
    const file = asset?.fields.file as { url?: string; details?: { image?: { width: number; height: number } } } | undefined;
    const dimensions = file?.details?.image;
    if (!file?.url || !dimensions || dimensions.width <= 0 || dimensions.height <= 0) throw new Error("Missing published image asset");
    text(fields.photoPermission, "photoPermission", true);
    url(fields.photoSource);
    return { src: url(file.url.startsWith("//") ? `https:${file.url}` : file.url), alt: text(fields.photoAlt, "photoAlt", true)!, ...dimensions };
  };
  const seen = new Set<string>();
  for (const entry of entries) {
    const kind = entry.sys.contentType?.sys.id;
    const f = entry.fields;
    if (kind === "home" || kind === "about") {
      if (seen.has(kind)) throw new Error(`Duplicate singleton: ${kind}`);
      seen.add(kind);
      if (kind === "home") result.homeIntroduction = { text: text(f.text, "text", true) };
      else result.about = { introduction: text(f.introduction, "introduction", true), vision: text(f.vision, "vision"), mission: text(f.mission, "mission"), philosophy: text(f.philosophy, "philosophy"), environmentPhoto: photo(f, "environmentPhoto") };
      continue;
    }
    if (!["researchArea", "project", "person", "publication"].includes(kind || "")) continue;
    const id = text(f.id ?? entry.sys.id, "id", true)!;
    if (seen.has(id)) throw new Error(`Duplicate content ID: ${id}`);
    seen.add(id);
    if (kind === "person") {
      const email = text(f.email, "email"), studentId = text(f.studentId, "studentId");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
      if (studentId && !/^\d+$/.test(studentId)) throw new Error("Invalid student ID");
      result.people = [...result.people, { id, name: text(f.name, "name", true)!, role: text(f.role, "role", true)!, studentId, email, nationality: text(f.nationality, "nationality"), initials: text(f.initials, "initials"), interests: text(f.interests, "interests"), profile: f.profileUrl ? { label: "Official profile", href: url(f.profileUrl) } : undefined, photo: photo(f, "photo") }];
    } else if (kind === "publication") {
      if (!Number.isInteger(f.year) || Number(f.year) < 1900 || Number(f.year) > new Date().getFullYear() + 1) throw new Error("Invalid publication year");
      if (!Array.isArray(f.authors) || !f.authors.length) throw new Error("Missing publication authors");
      result.publications = [...result.publications, { id, title: text(f.title, "title", true)!, authors: f.authors.map(a => text(a, "author", true)!), venue: text(f.venue, "venue", true)!, year: Number(f.year), paper: f.paperUrl ? { label: "Paper", href: url(f.paperUrl) } : undefined }];
    } else {
      const base = { id, title: text(f.title, "title", true)!, description: text(f.description, "description", true)!, category: text(f.category, "category") };
      if (kind === "researchArea") result.researchAreas = [...result.researchAreas, base];
      else {
        if (f.year !== undefined && (!Number.isInteger(f.year) || Number(f.year) < 1900 || Number(f.year) > new Date().getFullYear() + 1)) throw new Error("Invalid project year");
        if (f.links !== undefined && !Array.isArray(f.links)) throw new Error("Invalid resource links");
        const links = (f.links as { label: unknown; href: unknown }[] | undefined)?.map(link => ({ label: text(link.label, "link label", true)!, href: url(link.href) }));
        result.projects = [...result.projects, { ...base, subtitle: text(f.subtitle, "subtitle"), year: f.year as number | undefined, links }];
      }
    }
  }
  return result;
}

export const loadContent = cache(async (): Promise<Snapshot> => {
  const { CONTENTFUL_SPACE_ID: space, CONTENTFUL_DELIVERY_TOKEN: token, CONTENTFUL_ENVIRONMENT: environment } = process.env;
  if (!space && !token && !environment) return local;
  if (!space || !token || !environment) throw new Error("Set all Contentful delivery variables or none for local content");
  const entries: Entry[] = [], assets: Entry[] = [];
  let total = 0;
  do {
    const endpoint = new URL(`https://cdn.contentful.com/spaces/${encodeURIComponent(space)}/environments/${encodeURIComponent(environment)}/entries`);
    endpoint.search = new URLSearchParams({ limit: "1000", skip: String(entries.length), include: "2", order: "sys.createdAt", locale: "en-US" }).toString();
    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Contentful delivery failed (${response.status})`);
    const page = await response.json();
    if (!Array.isArray(page.items) || !Number.isInteger(page.total) || (page.total > entries.length && !page.items.length)) throw new Error("Invalid Contentful response");
    entries.push(...page.items); assets.push(...(page.includes?.Asset || [])); total = page.total;
  } while (entries.length < total);
  entries.sort((a, b) => Number(a.fields.order ?? 0) - Number(b.fields.order ?? 0));
  return decodeContentful(entries, assets);
});
