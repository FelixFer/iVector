import * as local from "../src/data/content.ts";
import { validateRecords } from "../src/data/records.ts";

export const kinds = ["home", "about", "researchArea", "project", "person", "publication"] as const;
export type CmsKind = (typeof kinds)[number];
export type CmsFields = {
  text?: string; introduction?: string; vision?: string; mission?: string; philosophy?: string;
  title?: string; description?: string; category?: string; subtitle?: string; year?: number;
  name?: string; role?: string; studentId?: string; email?: string; nationality?: string;
  initials?: string; interests?: string; profileUrl?: string; authors?: string[]; venue?: string;
  paperUrl?: string; codeUrl?: string; demoUrl?: string; links?: local.Resource[]; relatedIds?: string[];
  photoId?: string; photoAlt?: string; photoSource?: string; photoSourceUrl?: string; photoPermission?: string;
};
export type CmsEntry = {
  id: string; kind: CmsKind; order: number; publishedOrder: number | null; revision: number;
  draft: CmsFields; published: CmsFields | null; sourceNote: string; updatedAt: string;
};
export type CmsAsset = { id: string; key: string; mime: string; width: number; height: number; size: number; sha256: string };
export type Snapshot = Pick<typeof local, "homeIntroduction" | "about" | "researchAreas" | "projects" | "people" | "publications">;
export type PublishedEntry = { id: string; kind: CmsKind; fields: CmsFields; order: number };
export function assetPublicPath(asset: CmsAsset): `/cms-assets/${string}.webp` {
  if (!/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error("Invalid image checksum.");
  return `/cms-assets/${asset.sha256}.webp`;
}

const photoFields = ["photoId", "photoAlt", "photoSource", "photoSourceUrl", "photoPermission"];
const common = ["title", "description", "category", "relatedIds"];
const allowed: Record<CmsKind, readonly string[]> = {
  home: ["text"],
  about: ["introduction", "vision", "mission", "philosophy", ...photoFields],
  researchArea: common,
  project: [...common, "subtitle", "year", "paperUrl", "codeUrl", "demoUrl", "links"],
  person: ["name", "role", "studentId", "email", "nationality", "initials", "interests", "profileUrl", "relatedIds", ...photoFields],
  publication: ["title", "authors", "venue", "year", "paperUrl", "relatedIds"],
};

export function text(value: unknown, name: string, required = false): string | undefined {
  if (value === undefined || value === "") {
    if (required) throw new Error(`${name} is required.`);
    return undefined;
  }
  if (typeof value !== "string" || value.length > 20_000 || !value.trim()) throw new Error(`Invalid ${name}.`);
  return value.trim();
}
function url(value: unknown): local.Resource["href"] {
  const parsed = new URL(text(value, "URL", true)!);
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error("Use an HTTP or HTTPS URL without credentials.");
  return parsed.href as local.Resource["href"];
}
export function validateId(value: unknown): string {
  const id = text(value, "ID", true)!;
  if (id.length > 120 || /[\u0000-\u001f\u007f]/.test(id)) throw new Error("Invalid ID.");
  return id;
}
export function validateDraft(kind: CmsKind, input: unknown): CmsFields {
  if (!kinds.includes(kind) || !input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid content type or fields.");
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!allowed[kind].includes(key)) throw new Error(`Unsupported field: ${key}.`);
    if (value === undefined || value === "") continue;
    if (key === "year") {
      if (!Number.isInteger(value) || Number(value) < 1900 || Number(value) > new Date().getFullYear() + 1) throw new Error("Invalid year.");
      output[key] = value;
    } else if (key === "authors" || key === "relatedIds") {
      if (!Array.isArray(value) || value.length > 1000) throw new Error(`Invalid ${key}.`);
      output[key] = value.map(item => key === "relatedIds" ? validateId(item) : text(item, "Author", true)!);
      if (key === "relatedIds" && new Set(output[key] as string[]).size !== value.length) throw new Error("Duplicate related record.");
    } else if (key === "links") {
      if (!Array.isArray(value) || value.length > 30) throw new Error("Invalid resource links.");
      output[key] = value.map(link => ({ label: text(link?.label, "Link label", true)!, href: url(link?.href) }));
    } else {
      const result = text(value, key);
      if (result && key.endsWith("Url")) output[key] = url(result);
      else output[key] = result;
    }
  }
  if (output.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(output.email))) throw new Error("Invalid email.");
  if (output.studentId && !/^\d+$/.test(String(output.studentId))) throw new Error("Student ID must contain digits only.");
  return output as CmsFields;
}
export function validatePublish(entry: CmsEntry): void {
  const f = validateDraft(entry.kind, entry.draft);
  text(entry.sourceNote, "Verified source note", true);
  const required: Record<CmsKind, (keyof CmsFields)[]> = {
    home: ["text"], about: ["introduction"], researchArea: ["title", "description"],
    project: ["title", "description"], person: ["name", "role"], publication: ["title", "venue"],
  };
  for (const key of required[entry.kind]) text(f[key], key, true);
  if (entry.kind === "publication" && (!f.year || !f.authors?.length)) throw new Error("Publication year and ordered authors are required.");
  if (f.photoId) for (const key of ["photoAlt", "photoSource", "photoPermission"] as const) text(f[key], key, true);
}

export function decodePublished(entries: PublishedEntry[], assets: CmsAsset[]): Snapshot {
  const seen = new Set<string>();
  const sorted = [...entries].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const assetMap = new Map(assets.map(asset => [asset.id, asset]));
  if (assetMap.size !== assets.length) throw new Error("Duplicate image ID.");
  const photo = (f: CmsFields): local.Photo | undefined => {
    if (!f.photoId) return undefined;
    const asset = assetMap.get(f.photoId);
    if (!asset || asset.mime !== "image/webp" || !/^[a-f0-9]{64}$/.test(asset.sha256) || !Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width <= 0 || asset.height <= 0 || asset.width > 4096 || asset.height > 4096) throw new Error("Missing or invalid published image.");
    text(f.photoSource, "Image source", true); text(f.photoPermission, "Image permission", true);
    return { src: assetPublicPath(asset), alt: text(f.photoAlt, "Image alt text", true)!, width: asset.width, height: asset.height };
  };
  let homeIntroduction: Snapshot["homeIntroduction"] | undefined;
  let about: Snapshot["about"] | undefined;
  const researchAreas: local.ResearchArea[] = [], projects: local.Project[] = [], people: local.Person[] = [], publications: local.Publication[] = [];
  for (const entry of sorted) {
    validateId(entry.id);
    if (seen.has(entry.id) || !Number.isInteger(entry.order)) throw new Error("Duplicate record or invalid order.");
    seen.add(entry.id);
    const f = validateDraft(entry.kind, entry.fields);
    const required = (key: keyof CmsFields) => text(f[key], key, true)!;
    if (entry.kind === "home") {
      if (entry.id !== "home" || homeIntroduction) throw new Error("Invalid Home singleton.");
      homeIntroduction = { text: required("text") };
    } else if (entry.kind === "about") {
      if (entry.id !== "about" || about) throw new Error("Invalid About singleton.");
      about = { introduction: required("introduction"), vision: f.vision, mission: f.mission, philosophy: f.philosophy, environmentPhoto: photo(f) };
    } else if (entry.kind === "person") {
      people.push({ id: entry.id, relatedIds: f.relatedIds, name: required("name"), role: required("role"), studentId: f.studentId, email: f.email, nationality: f.nationality, initials: f.initials, interests: f.interests, profile: f.profileUrl ? { label: "Official profile", href: url(f.profileUrl) } : undefined, photo: photo(f) });
    } else if (entry.kind === "publication") {
      if (!f.year || !f.authors?.length) throw new Error("Publication year and authors are required.");
      publications.push({ id: entry.id, relatedIds: f.relatedIds, title: required("title"), authors: f.authors, venue: required("venue"), year: f.year, paper: f.paperUrl ? { label: "Paper", href: url(f.paperUrl) } : undefined });
    } else {
      const base = { id: entry.id, relatedIds: f.relatedIds, title: required("title"), description: required("description"), category: f.category };
      if (entry.kind === "researchArea") researchAreas.push(base);
      else {
        const links = [...(f.links ?? [])];
        for (const [key, label] of [["paperUrl", "Paper"], ["codeUrl", "Code"], ["demoUrl", "Demo"]] as const) if (f[key]) links.push({ label, href: url(f[key]) });
        projects.push({ ...base, subtitle: f.subtitle, year: f.year, links });
      }
    }
  }
  if (!homeIntroduction || !about) throw new Error("Published Home and About are required.");
  const snapshot = { homeIntroduction, about, researchAreas, projects, people, publications };
  validateRecords(snapshot);
  return snapshot;
}
export function toPublishedSnapshot(entries: CmsEntry[], assets: CmsAsset[]): Snapshot {
  return decodePublished(entries.filter(e => e.published !== null).map(e => ({ id: e.id, kind: e.kind, order: e.publishedOrder ?? e.order, fields: e.published! })), assets);
}

export function validateSnapshot(input: unknown): Snapshot {
  const object = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid content snapshot.");
    return value as Record<string, unknown>;
  };
  const raw = object(input), home = object(raw.homeIntroduction), about = object(raw.about);
  const entries: PublishedEntry[] = [
    { id: "home", kind: "home", order: 0, fields: validateDraft("home", { text: home.text }) },
    { id: "about", kind: "about", order: 0, fields: validateDraft("about", { introduction: about.introduction, vision: about.vision, mission: about.mission, philosophy: about.philosophy }) },
  ];
  const photos = new Map<string, local.Photo>();
  const readPhoto = (value: unknown): local.Photo | undefined => {
    if (value === undefined) return undefined;
    const p = object(value);
    if (typeof p.src !== "string" || !/^\/cms-assets\/[a-f0-9]{64}\.webp$/.test(p.src) || !Number.isInteger(p.width) || !Number.isInteger(p.height) || Number(p.width) <= 0 || Number(p.height) <= 0 || Number(p.width) > 4096 || Number(p.height) > 4096) throw new Error("Invalid bundled image.");
    return { src: p.src as local.Photo["src"], alt: text(p.alt, "Image alt text", true)!, width: Number(p.width), height: Number(p.height) };
  };
  for (const [key, kind] of [["researchAreas", "researchArea"], ["projects", "project"], ["people", "person"], ["publications", "publication"]] as const) {
    if (!Array.isArray(raw[key])) throw new Error(`Missing directory: ${key}.`);
    (raw[key] as unknown[]).forEach((value, order) => {
      const record = object(value), id = validateId(record.id);
      const fields = { ...record };
      delete fields.id; delete fields.photo; delete fields.profile; delete fields.paper;
      if (record.profile !== undefined) fields.profileUrl = object(record.profile).href;
      if (record.paper !== undefined) fields.paperUrl = object(record.paper).href;
      entries.push({ id, kind, order, fields: validateDraft(kind, fields) });
      const image = readPhoto(record.photo);
      if (image) photos.set(id, image);
    });
  }
  const snapshot = decodePublished(entries, []);
  return { ...snapshot, about: { ...snapshot.about, environmentPhoto: readPhoto(about.environmentPhoto) }, people: snapshot.people.map(person => ({ ...person, photo: photos.get(person.id) })) };
}

export const seedEntries: CmsEntry[] = [
  { id: "home", kind: "home", draft: { text: local.homeIntroduction.text }, sourceNote: "Approved institutional identity copy." },
  { id: "about", kind: "about", draft: { introduction: local.about.introduction }, sourceNote: "Approved institutional identity copy." },
  ...local.people.map(person => ({ id: person.id, kind: "person" as const, draft: { name: person.name, role: person.role, studentId: person.studentId, email: person.email, nationality: person.nationality, initials: person.initials, interests: person.interests, profileUrl: person.profile?.href }, sourceNote: person.profile?.href ?? "Member details supplied and approved by project owner on 2026-11-15." })),
].map((entry, order) => ({ ...entry, order, revision: 1, publishedOrder: null, published: null, updatedAt: new Date(0).toISOString() } as CmsEntry));
