"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { CmsAsset, CmsEntry, CmsFields, CmsKind } from "../../../cms/model";
import styles from "./dashboard.module.css";

export const sectionLabels: Record<CmsKind, string> = {
  home: "Home", about: "About", researchArea: "Research", project: "Projects", person: "People", publication: "Publications",
};

export function entryLabel(entry: CmsEntry) {
  return entry.draft.name || entry.draft.title || (entry.kind === "home" || entry.kind === "about" ? sectionLabels[entry.kind] : entry.id || "New record");
}

type FieldName = Exclude<keyof CmsFields, "authors" | "relatedIds" | "links" | "year">;
type EditorProps = {
  value: CmsEntry;
  entries: CmsEntry[];
  assets: CmsAsset[];
  dirty: boolean;
  busy: boolean;
  saved: boolean;
  onChange: (entry: CmsEntry) => void;
  onSave: () => void;
  onAction: (action: "publish" | "unpublish" | "delete") => void;
  onReload: () => void;
  onUpload: (file: File) => Promise<CmsAsset>;
  getImageUrl: (id: string) => Promise<string>;
};

export default function Editor({ value, entries, assets, dirty, busy, saved, onChange, onSave, onAction, onReload, onUpload, getImageUrl }: EditorProps) {
  const { draft: fields, kind } = value;
  const [preview, setPreview] = useState({ id: "", url: "" });
  const [photoError, setPhotoError] = useState("");
  const selectedPhoto = assets.find(asset => asset.id === fields.photoId);

  useEffect(() => {
    let cancelled = false;
    if (!fields.photoId) return;
    const id = fields.photoId;
    getImageUrl(id).then(url => { if (!cancelled) setPreview({ id, url }); }).catch(() => { if (!cancelled) setPhotoError("The image could not be loaded. Use Refresh image to try again."); });
    return () => { cancelled = true; };
  }, [fields.photoId, getImageUrl]);

  function update<K extends keyof CmsFields>(key: K, next: CmsFields[K]) {
    onChange({ ...value, draft: { ...fields, [key]: next } });
  }

  function field(name: FieldName, label: string, multiline = false, type = "text") {
    const shared = { name, value: fields[name] ?? "", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(name, event.target.value), disabled: busy };
    return <label className={styles.field} key={name}>{label}{multiline ? <textarea {...shared} rows={4} /> : <input {...shared} type={type} />}</label>;
  }

  const related = entries.filter(entry => entry.id !== value.id && !["home", "about"].includes(entry.kind));
  const singleton = kind === "home" || kind === "about";

  return (
    <section className={styles.editor} aria-labelledby="editor-heading">
      <div className={styles.editorHeading}>
        <h2 id="editor-heading">{saved ? entryLabel(value) : `Add ${sectionLabels[kind].toLowerCase()} record`}</h2>
        <span className={styles.hint}>{dirty ? "Unsaved changes" : value.published ? "Published version available" : "Draft"}</span>
      </div>
      <form className={styles.form} onSubmit={event => { event.preventDefault(); onSave(); }}>
        <div className={styles.pair}>
          <label className={styles.field}>Record ID<input aria-label="Record ID" aria-describedby="cms-id-help" value={value.id} readOnly={saved || singleton} required disabled={busy} maxLength={120} onChange={event => onChange({ ...value, id: event.target.value })} /><small id="cms-id-help">Permanent after saving. Used by links and related records.</small></label>
          <label className={styles.field}>Display order<input aria-label="Display order" aria-describedby="cms-order-help" type="number" step="1" value={Number.isNaN(value.order) ? "" : value.order} required disabled={busy} onChange={event => onChange({ ...value, order: event.target.valueAsNumber })} /><small id="cms-order-help">Lower values appear first. Publications remain newest first.</small></label>
        </div>
        {kind === "home" && field("text", "Introduction", true)}
        {kind === "about" && <>
          {field("introduction", "Introduction", true)}
          {field("vision", "Vision", true)}
          {field("mission", "Mission", true)}
          {field("philosophy", "Research approach", true)}
        </>}
        {(kind === "researchArea" || kind === "project") && <>
          {field("title", "Title")}
          {kind === "project" && field("subtitle", "Subtitle")}
          {field("description", "Description", true)}
          {field("category", "Category")}
        </>}
        {kind === "person" && <>
          <div className={styles.pair}>{field("name", "Name")}{field("role", "Role")}</div>
          <div className={styles.pair}>{field("studentId", "Student ID")}{field("email", "Email", false, "email")}</div>
          <div className={styles.pair}>{field("nationality", "Nationality")}{field("initials", "Portrait initials")}</div>
          {field("interests", "Research interests", true)}
          {field("profileUrl", "Official profile URL", false, "url")}
        </>}
        {kind === "publication" && <>
          {field("title", "Publication title")}
          <label className={styles.field}>Authors, in citation order<textarea aria-label="Authors, in citation order" aria-describedby="cms-authors-help" name="authors" rows={5} value={(fields.authors ?? []).join("\n")} disabled={busy} onChange={event => update("authors", event.target.value.split("\n"))} /><small id="cms-authors-help">One author per line. Preserve the published author order.</small></label>
          {field("venue", "Venue")}
        </>}
        {(kind === "publication" || kind === "project") && <label className={styles.field}>Year<input name="year" type="number" min="1900" max={new Date().getFullYear() + 1} step="1" value={fields.year ?? ""} disabled={busy} onChange={event => update("year", event.target.value === "" ? undefined : event.target.valueAsNumber)} /></label>}
        {(kind === "publication" || kind === "project") && field("paperUrl", "Paper URL", false, "url")}
        {kind === "project" && <>
          {field("codeUrl", "Code URL", false, "url")}
          {field("demoUrl", "Demo URL", false, "url")}
          <fieldset className={styles.fieldset}><legend>Other resources</legend>
            {(fields.links ?? []).map((link, index) => <div className={styles.linkRow} key={index}>
              <label className={styles.field}>Link label<input value={link.label} disabled={busy} onChange={event => update("links", fields.links!.map((current, i) => i === index ? { ...current, label: event.target.value } : current))} /></label>
              <label className={styles.field}>URL<input type="url" value={link.href} disabled={busy} onChange={event => update("links", fields.links!.map((current, i) => i === index ? { ...current, href: event.target.value as typeof link.href } : current))} /></label>
              <button className="button button-secondary" type="button" disabled={busy} aria-label={`Remove resource ${index + 1}`} onClick={() => update("links", fields.links!.filter((_, i) => i !== index))}>Remove</button>
            </div>)}
            <div className={styles.actions}><button className="button button-secondary" type="button" disabled={busy} onClick={() => update("links", [...(fields.links ?? []), { label: "", href: "" as `https://${string}` }])}>Add resource</button></div>
          </fieldset>
        </>}
        {(kind === "about" || kind === "person") && <fieldset className={styles.fieldset}><legend>{kind === "person" ? "Portrait" : "Environment image"}</legend>
          <div className={styles.photo}>
            {/* The source is a short-lived authenticated URL, never a public storage credential. */}
            {fields.photoId && preview.id === fields.photoId && preview.url && <Image unoptimized src={preview.url} alt={fields.photoAlt || "Selected image"} width={128} height={128} onError={() => setPhotoError("The image preview is unavailable. Use Refresh image to try again.")} />}
            {selectedPhoto && <p className={styles.hint}>{selectedPhoto.width} × {selectedPhoto.height} px</p>}
          </div>
          <label className={styles.field}>Upload image<input aria-label="Upload image" aria-describedby="cms-upload-help" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async event => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setPhotoError("");
            if (file.size > 5 * 1024 * 1024) { setPhotoError("Choose an image smaller than 5 MB."); return; }
            try { const asset = await onUpload(file); setPreview({ id: "", url: "" }); update("photoId", asset.id); }
            catch (error) { setPhotoError(error instanceof Error ? error.message : "Image upload failed."); }
          }} /><small id="cms-upload-help">JPEG, PNG or WebP, up to 5 MB. No photograph is required.</small></label>
          {photoError && <p role="alert">{photoError}</p>}
          {fields.photoId && <div className={styles.actions}>
            <button type="button" className="button button-secondary" disabled={busy} onClick={async () => { try { setPhotoError(""); setPreview({ id: fields.photoId!, url: await getImageUrl(fields.photoId!) }); } catch { setPhotoError("The image preview is unavailable. Try again after signing in."); } }}>Refresh image</button>
            <button type="button" className="button button-secondary" disabled={busy} onClick={() => { update("photoId", undefined); setPreview({ id: "", url: "" }); }}>Remove image</button>
          </div>}
          {field("photoAlt", "Image description (alt text)")}
          {field("photoSource", "Image source", true)}
          {field("photoSourceUrl", "Source URL, if available", false, "url")}
          {field("photoPermission", "Permission or licence", true)}
        </fieldset>}
        {!singleton && <fieldset className={styles.fieldset}><legend>Related records</legend>
          {related.length ? <div className={styles.choices}>{related.map(entry => <label key={entry.id} className={styles.choice}>
            <input type="checkbox" disabled={busy} checked={fields.relatedIds?.includes(entry.id) ?? false} onChange={event => update("relatedIds", event.target.checked ? [...(fields.relatedIds ?? []), entry.id] : fields.relatedIds?.filter(id => id !== entry.id))} />
            <span>{entryLabel(entry)} <small>({sectionLabels[entry.kind]}{entry.published ? "" : ", draft"})</small></span>
          </label>)}</div> : <p className={styles.hint}>No other records are available.</p>}
          <p className={styles.hint}>Related records must be published before this record can reference them publicly.</p>
        </fieldset>}
        <label className={styles.field}>Verified source note<textarea aria-label="Verified source note" aria-describedby="cms-source-help" name="sourceNote" value={value.sourceNote} disabled={busy} onChange={event => onChange({ ...value, sourceNote: event.target.value })} rows={3} /><small id="cms-source-help">Internal only. Record the source or approval for this content before publishing.</small></label>
        <p className={styles.hint}>Save drafts while preparing content. Publishing checks required fields and references.</p>
        <div className={styles.actions}>
          <button className="button" type="submit" disabled={busy}>{busy ? "Working…" : "Save draft"}</button>
          {saved && <button className="button button-secondary" type="button" disabled={busy || dirty} onClick={() => onAction("publish")}>Publish saved draft</button>}
          {saved && value.published && !singleton && <button className="button button-secondary" type="button" disabled={busy || dirty} onClick={() => onAction("unpublish")}>Unpublish</button>}
          {saved && !value.published && !singleton && <button className="button button-secondary" type="button" disabled={busy} onClick={() => onAction("delete")}>Delete draft</button>}
          {saved && <button className={styles.textButton} type="button" disabled={busy} onClick={onReload}>Reload saved version</button>}
        </div>
        {dirty && saved && <p className={styles.hint}>Save your changes before publishing.</p>}
      </form>
    </section>
  );
}
