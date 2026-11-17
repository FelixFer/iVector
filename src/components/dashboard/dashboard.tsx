"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CmsAsset, CmsEntry, CmsKind } from "../../../cms/model";
import Editor, { entryLabel, sectionLabels } from "./editor";
import styles from "./dashboard.module.css";

const authUrl = process.env.NEXT_PUBLIC_CMS_AUTH_URL;
const apiUrl = process.env.NEXT_PUBLIC_CMS_API_URL;
const accountEmail = "611521418@gms.ndhu.edu.tw";
type AuthClient = import("@neon/neon-js/auth").VanillaBetterAuthClient;
let authPromise: Promise<AuthClient> | undefined;

function auth() {
  if (!authUrl) throw new Error("Staff authentication is not configured.");
  return authPromise ??= Promise.all([import("@neon/neon-js/auth"), import("@neon/neon-js/auth/vanilla/adapters")]).then(([sdk, adapters]) => sdk.createAuthClient(authUrl, {
    adapter: adapters.BetterAuthVanillaAdapter({ fetchOptions: { credentials: "include" } }),
  }));
}

function blankEntry(kind: CmsKind, order: number): CmsEntry {
  return { id: kind === "home" || kind === "about" ? kind : "", kind, order, revision: 0, publishedOrder: null, draft: {}, published: null, sourceNote: "", updatedAt: "" };
}

export default function Dashboard() {
  const configured = Boolean(authUrl && apiUrl);
  const [checking, setChecking] = useState(configured);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("iVector");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [assets, setAssets] = useState<CmsAsset[]>([]);
  const [section, setSection] = useState<CmsKind>("home");
  const [value, setValue] = useState<CmsEntry | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const mounted = useRef(true);
  const selectedOnce = useRef(false);

  const request = useCallback(async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
    const client = await auth();
    const session = await client.getSession();
    const token = session.data?.session?.token;
    if (session.error || !token) {
      setAuthenticated(false);
      const message = "Your session expired. Sign in again. Unsaved changes remain in this tab.";
      setError(message);
      throw new Error(message);
    }
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
    const response = await fetch(`${apiUrl!.replace(/\/$/, "")}${path}`, { ...options, headers, cache: "no-store", credentials: "omit" });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      const message = response.status === 401 ? "Your session expired. Sign in again. Unsaved changes remain in this tab." : response.status === 403 ? "This account does not have dashboard access." : result?.error || "The request failed. Your unsaved changes remain available.";
      if (response.status === 401 || response.status === 403) { setAuthenticated(false); setError(message); }
      throw new Error(message);
    }
    return result as T;
  }, []);

  const load = useCallback(async () => {
    const result = await request<{ entries: CmsEntry[]; assets: CmsAsset[] }>("/entries");
    if (!mounted.current) return;
    const ordered = [...result.entries].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    setEntries(ordered); setAssets(result.assets); setAuthenticated(true);
    if (!selectedOnce.current) {
      const home = ordered.find(entry => entry.kind === "home") ?? null;
      setValue(home); setEditingId(home?.id ?? null); setSection("home");
      selectedOnce.current = true;
    }
  }, [request]);

  useEffect(() => {
    mounted.current = true;
    if (!configured) return;
    async function initialize() {
      try {
        const client = await auth();
        const params = new URLSearchParams(window.location.search);
        if (params.get("token")) { if (mounted.current) setResetToken(params.get("token")!); return; }
        if (params.get("error")) throw new Error("The recovery link is invalid or expired. Request another email.");
        const session = await client.getSession();
        if (session.error) throw new Error("Sign-in service could not be reached. Try signing in again.");
        if (session.data?.session) await load();
      } catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : "Staff sign-in is unavailable."); }
      finally { if (mounted.current) setChecking(false); }
    }
    void initialize();
    return () => { mounted.current = false; };
  }, [configured, load]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (authenticated) document.getElementById("dashboard-account")?.focus();
  }, [authenticated]);

  function mayDiscard() { return !dirty || window.confirm("Discard unsaved changes?"); }
  function select(entry: CmsEntry | null, nextSection = section) {
    if (!mayDiscard()) return;
    setSection(nextSection); setValue(entry ? structuredClone(entry) : null); setEditingId(entry?.id ?? null); setDirty(false); setMessage(""); setError("");
  }
  function change(entry: CmsEntry) { setValue(entry); setDirty(true); }
  function accept(entry: CmsEntry) {
    setEntries(previous => [...previous.filter(current => current.id !== entry.id), entry].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)));
    setValue(structuredClone(entry)); setEditingId(entry.id); setDirty(false);
  }

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The request failed. Try again."); }
    finally { setBusy(false); }
  }

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      if (username !== "iVector") throw new Error("Sign-in failed. Check your username and password.");
      const result = await (await auth()).signIn.email({ email: accountEmail, password });
      setPassword("");
      if (result.error) throw new Error("Sign-in failed. Check your username and password.");
      await load();
    });
  }

  async function save() {
    if (!value) return;
    await run(async () => {
      const result = await request<{ entry: CmsEntry }>(editingId ? `/entries/${encodeURIComponent(editingId)}` : "/entries", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({ id: value.id, kind: value.kind, order: value.order, draft: value.draft, sourceNote: value.sourceNote, revision: value.revision }),
      });
      accept(result.entry); setMessage("Draft saved. The published version is unchanged.");
    });
  }

  async function act(action: "publish" | "unpublish" | "delete") {
    if (!value || !editingId) return;
    const prompt = action === "publish" ? "Publish this saved draft for the next website build?" : action === "unpublish" ? "Remove this record from the next website build?" : "Permanently delete this unpublished draft?";
    if (!window.confirm(prompt)) return;
    await run(async () => {
      const result = await request<{ entry: CmsEntry }>(`/entries/${encodeURIComponent(editingId)}${action === "delete" ? "" : `/${action}`}`, { method: action === "delete" ? "DELETE" : "POST", body: JSON.stringify({ revision: value.revision }) });
      if (action === "delete") {
        const remaining = entries.filter(entry => entry.id !== editingId);
        setEntries(remaining); const next = remaining.find(entry => entry.kind === section) ?? null; setValue(next); setEditingId(next?.id ?? null); setDirty(false);
        setMessage("Draft deleted.");
      } else { accept(result.entry); setMessage(action === "publish" ? "Published for the next website build. The current website has not changed." : "Unpublished for the next website build."); }
    });
  }

  const getImageUrl = useCallback(async (id: string) => (await request<{ url: string }>(`/assets/${encodeURIComponent(id)}/url`)).url, [request]);

  async function upload(file: File) {
    setBusy(true); setError("");
    try {
      const form = new FormData(); form.set("file", file);
      const result = await request<{ asset: CmsAsset }>("/assets", { method: "POST", body: form });
      setAssets(previous => [...previous.filter(asset => asset.id !== result.asset.id), result.asset]);
      return result.asset;
    } finally { setBusy(false); }
  }

  return <>
    {error && <p className={styles.status} role="alert">{error}</p>}
    {message && <p className={styles.status} role="status">{message}</p>}
    {checking ? <p role="status">Checking staff session…</p> : !authenticated ? <section className={styles.login} aria-labelledby="sign-in-heading">
      <h2 id="sign-in-heading">{resetToken ? "Set a new password" : "Staff sign-in"}</h2>
      {!configured && <p className={styles.status}>Staff sign-in is not connected yet. Complete Neon activation to enable editing.</p>}
      <form className={styles.form} onSubmit={resetToken ? event => {
        event.preventDefault();
        void run(async () => {
          if (password !== confirmation) throw new Error("The passwords do not match.");
          const result = await (await auth()).resetPassword({ newPassword: password, token: resetToken });
          if (result.error) throw new Error("The password could not be reset. Request a new recovery email.");
          setResetToken(""); setPassword(""); setConfirmation(""); window.history.replaceState(null, "", "/dashboard/");
          setMessage("Password updated. Sign in with your new password.");
        });
      } : signIn}>
        {!resetToken && <label className={styles.field}>Username<input name="username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required disabled={!configured || busy} autoCapitalize="none" spellCheck={false} /></label>}
        <label className={styles.field}>{resetToken ? "New password" : "Password"}<input aria-label={resetToken ? "New password" : "Password"} aria-describedby={resetToken ? "cms-password-help" : undefined} name="password" type="password" autoComplete={resetToken ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} required minLength={resetToken ? 12 : undefined} disabled={!configured || busy} />{resetToken && <small id="cms-password-help">Use at least 12 characters.</small>}</label>
        {resetToken && <label className={styles.field}>Confirm new password<input name="passwordConfirmation" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required minLength={12} disabled={!configured || busy} /></label>}
        <div className={styles.actions}><button className="button" type="submit" disabled={!configured || busy}>{busy ? "Working…" : resetToken ? "Set password" : "Sign in"}</button></div>
      </form>
      <button type="button" className={styles.textButton} disabled={!configured || busy} onClick={() => void run(async () => {
        const result = await (await auth()).requestPasswordReset({ email: accountEmail, redirectTo: `${window.location.origin}/dashboard/` });
        if (result.error) throw new Error("The recovery email could not be requested. Try again.");
        setMessage("Recovery email requested. Check the account mailbox.");
      })}>Send recovery email</button>
    </section> : <>
      <div className={styles.toolbar}><p id="dashboard-account" tabIndex={-1}>Signed in as <strong>iVector</strong></p><button className="button button-secondary" type="button" disabled={busy} onClick={() => {
        if (!mayDiscard()) return;
        void run(async () => {
          const result = await (await auth()).signOut();
          if (result.error) throw new Error("Sign-out failed. Try again.");
          setAuthenticated(false); setEntries([]); setAssets([]); setValue(null); setEditingId(null); setDirty(false); selectedOnce.current = false; setPassword(""); setMessage("Signed out.");
        });
      }}>Sign out</button></div>
      <nav className={styles.tabs} aria-label="Content sections">{(Object.entries(sectionLabels) as [CmsKind, string][]).map(([kind, label]) => <button key={kind} type="button" aria-current={section === kind ? "true" : undefined} disabled={busy} onClick={() => select(entries.find(entry => entry.kind === kind) ?? null, kind)}>{label}</button>)}</nav>
      <div className={styles.layout}>
        <aside className={styles.directory} aria-label={`${sectionLabels[section]} records`}>
          {(!["home", "about"].includes(section) || !entries.some(entry => entry.kind === section)) && <button className="button button-secondary" type="button" disabled={busy} onClick={() => { if (!mayDiscard()) return; setValue(blankEntry(section, Math.max(0, ...entries.map(entry => entry.order)) + 1)); setEditingId(null); setDirty(false); setError(""); setMessage(""); }}>Add record</button>}
          <ul className={styles.records}>{entries.filter(entry => entry.kind === section).map(entry => <li key={entry.id}><button type="button" aria-current={editingId === entry.id ? "true" : undefined} disabled={busy} onClick={() => select(entry)}><span>{entryLabel(entry)}</span><small>{entry.published ? "Published" : "Draft"}</small></button></li>)}</ul>
          {!entries.some(entry => entry.kind === section) && <p className={styles.hint}>No records in this section.</p>}
        </aside>
        {value ? <Editor key={`${section}-${editingId ?? "new"}`} value={value} entries={entries} assets={assets} dirty={dirty} busy={busy} saved={editingId !== null} onChange={change} onSave={() => void save()} onAction={action => void act(action)} onUpload={upload} getImageUrl={getImageUrl} onReload={() => { if (mayDiscard()) void run(async () => { const result = await request<{ entries: CmsEntry[]; assets: CmsAsset[] }>("/entries"); setEntries(result.entries); setAssets(result.assets); const current = result.entries.find(entry => entry.id === editingId); setValue(current ?? null); setEditingId(current?.id ?? null); setDirty(false); }); }} /> : <p className={styles.hint}>Select a record or add one to start editing.</p>}
      </div>
    </>}
  </>;
}
