import { cache } from "react";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as local from "./content";
import { validateRecords } from "./records";
import { validateSnapshot, type Snapshot } from "../../cms/model";

export const loadContent = cache(async (): Promise<Snapshot> => {
  const source = process.env.CMS_CONTENT_SOURCE ?? "local";
  if (source === "local") { validateRecords(local); return local; }
  if (source !== "neon") throw new Error("CMS_CONTENT_SOURCE must be local or neon.");
  const saved = JSON.parse(await readFile(resolve(".cms/snapshot.json"), "utf8"));
  if (saved?.version !== 1) throw new Error("Unsupported CMS snapshot. Run npm run cms:build again.");
  return validateSnapshot(saved.content);
});
