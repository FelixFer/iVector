# Neon CMS and private review handoff

## Status and boundaries

The owner confirmed successful sign-in to the connected local dashboard on 2026-11-17. This is user-confirmed live authentication, in addition to the automated mock-service tests. Real image upload and recovery mail delivery have not been independently verified; no approved photographs were supplied for the initial import. Keep the existing approved Auth user ID when changing its password.

Live activation verified on 2026-11-17: the approved staff Auth account exists and its immutable ID is bound to the deployed `ivectorcms` Function. Separate `ivector_app` and `ivector_build` SQL logins have only their CMS runtime/reader group grants. The reader can query seven published records and receives PostgreSQL permission-denied for drafts. Missing and forged bearer tokens return 401 from the deployed Function. `cms:check`, the live-content production build, and `cms:verify` passed. Browser password sign-in, real recovery mail, image upload, and isolated backup restoration still require live verification.

Backup restoration was subsequently verified on 2026-11-17 in the isolated `cms-restore-check` branch: all seven records' IDs, draft/published fields, ordering, revisions, and provenance matched the private backup. No image assets currently exist, so media restoration remains unexercised. Neon rejected schema-only branching for the SQL group roles; a regular expiring child branch was used instead, and only that explicitly verified child's copied CMS tables were cleared before restoring. Production was untouched. The child branch expires on 2026-11-18 at 06:50 UTC. Browser password sign-in, recovery mail, and live image upload remain pending.

### Function deployment on Windows

The CLI native-package staging could not spawn npm on this Windows installation. `neon.ts` therefore deploys a prebuilt archive. Prepare it with these commands, then deploy using private environment values:

```powershell
npm.cmd install --prefix .cms/function --no-save --package-lock=false --ignore-scripts --cpu=arm64 --os=linux --libc=glibc sharp@0.35.5
node scripts/cms-bundle.mjs
npx.cmd --offline neon@latest deploy --env .env.local
```

The archive bundles the handler and ships Sharp's Linux ARM64 glibc dependencies. `.cms/` and private environment files remain ignored. The Function uses `CMS_DATABASE_URL`, never the automatically injected owner connection. No website deployment is performed by this command.

Activation progress verified on 2026-11-17: the Free Singapore project `broad-queen-70865087` is linked to branch `production`; authentication, private Object Storage, and Functions were selected at creation. The CMS SQL schema and seven approved published seed records were initialized successfully. Five project Neon skills are installed and current; `.codex/config.toml` contains a project-scoped OAuth MCP URL. Service variables were pulled into ignored `.env.neon.local`, preserving other environment files. The staff account, restricted login roles, Function deployment, live recovery, and backup restoration are still pending. Browser verification passed 78 standard tests (five configured scenarios skipped there), then all seven dashboard tests against isolated mock services.

The CMS uses a protected `/dashboard/` route in the existing static site, one authenticated Neon Function, PostgreSQL, and a private image bucket. Service activation, real account recovery, live role permissions, and backup restoration must be verified with the owner's signed-in Neon account. This document does not claim those external checks have passed. No public website deployment is included.

The actual source repository is **FelixFer/iVector**, a public GitHub repository. Its workflow builds approved local records without remote CMS credentials. Never upload private CMS snapshots, backups, environment files, draft screenshots, or authenticated test artifacts to that repository or its public Actions artifacts.

## Approved content and editing scope

Initial setup imports only the existing approved Home/About copy and five people as the initial published site. Yu-Chieh Ho's identity and Assistant Professor role are supported by the [official NDHU faculty directory](https://www.csie.ndhu.edu.tw/en/professors-en/). Four master’s student records, nationalities, student IDs, and derived emails were supplied by the owner on 2026-11-15. No photographs were supplied; initials remain the fallback. Research, Projects, and Publications remain empty.

The dashboard edits Home/About and the four academic directories, including friendly resource URLs, explicit related-record selections, ordering, and People/About photographs. Global identity, navigation, SEO configuration, fictional guides, pixel artwork, atmosphere, motion, and scene geometry remain in code. Do not add academic claims or real-person imagery without verified material and permission.

## Activate the free backend

1. Sign into the owner's [Neon Console](https://console.neon.tech/) securely. Create one **Free** project in **AWS Asia Pacific (Singapore)**. Keep the free plan and scale-to-zero; do not accept a paid upgrade. Check the current [free allowances](https://neon.com/pricing) in the account before provisioning.
2. Enable Managed Better Auth for the selected branch. Keep the unused Data API disabled. Provision exactly one account with display name **iVector** and recovery email **611521418@gms.ndhu.edu.tw**. Set a strong replacement password privately, never the password posted in chat. Record the account's immutable Auth user ID for `CMS_OWNER_ID`. A matching username or email does not authorize another user.
3. Copy `.env.example` to ignored `.env.local`. Add the owner connection as `CMS_SETUP_DATABASE_URL` locally and run `npm run cms:setup`. A new empty CMS receives the seven approved published records atomically. Reruns preserve all existing records, drafts, and deliberate removals. A partial database missing published Home/About fails for repair rather than silently publishing drafts.
4. Create separate Neon SQL login roles through the Console, with generated private passwords. Grant `ivector_cms_runtime` to the Function login and `ivector_cms_reader` to the private build login. The runtime must not own the schema/tables or have role/schema administration rights. The reader receives only the two published views. Never use the owner connection for the Function or expose SQL connections in browser variables.
5. Create one private Object Storage bucket. Record the branch-specific endpoint and private local storage credentials as `CMS_STORAGE_*`. Use read-only storage credentials for builds when available. The bucket is not public; draft previews use short-lived authenticated URLs.
6. Deploy `functions/cms.ts` as the branch's CMS Function using the current [Neon Functions workflow](https://neon.com/docs/compute/functions/overview). Set its `CMS_DATABASE_URL`, `CMS_OWNER_ID`, `CMS_ALLOWED_ORIGINS`, and `CMS_BUCKET` in protected runtime configuration. Neon supplies branch Auth and storage credentials; explicit `CMS_STORAGE_*` aliases are supported when injection is unavailable. Never pass secret values in chat or visible command arguments.
7. Add the two public endpoints to `.env.local`: `NEXT_PUBLIC_CMS_AUTH_URL` and `NEXT_PUBLIC_CMS_API_URL`. Permit only the intended localhost review origins in Auth trusted origins and `CMS_ALLOWED_ORIGINS`; add the confirmed production origin only at deployment. The Function verifies tokens independently of CORS.
8. Build locally, open `/dashboard/`, and test sign-in, sign-out, recovery, expired sessions, and rejection of another authenticated account. The form shows username **iVector** while Neon uses its recovery email internally. Hide public registration; authorization remains enforced even if a provider registration endpoint exists.

A shared account attributes every edit to the same identity. Rotate its password when access changes. Before public activation, confirm trusted domains, recovery mail delivery, secure hosting, and the [Neon Auth production settings](https://neon.com/docs/auth/production-checklist).

## Editing and publishing

Save draft preserves the published version. Publish validates required copy, explicit relationships, years/authors/URLs, and image metadata before replacing that record's published fields/order. Revision conflicts retain the unsaved form and require reloading/reviewing the current record. Remove inbound references before unpublishing a directory entry. Home/About stay published. A published or referenced record cannot be deleted.

For images, upload an approved raster file, supply meaningful alt text, a descriptive source, and permission; an optional source URL can accompany owner-supplied photographs. Upload validation and WebP conversion run server-side. No source URL is required for an original photograph. Publishing content updates Neon, **not the deployed website**.

## Private review commands

```powershell
npm run cms:check
npm run cms:build
npm run cms:verify
npm run preview
```

`cms:check` reads one consistent published snapshot and checks referenced image availability/checksums without writing files. `cms:build` downloads only published referenced images, validates the content, and builds `out/`. Internal provenance, drafts, authentication, and storage secrets stay out of public output. Serve the export at http://127.0.0.1:4173 and review all seven public pages, the 404, and the dashboard shell. Stop the preview before running browser tests.

The ignored `.cms/snapshot.json` contains only the public content used for that build; `public/cms-assets/` contains its published images. Normal `npm run build` clears generated CMS images and selects approved local records explicitly. CMS errors fail private builds rather than substituting stale local records. Retain a successful private export separately for rollback; rebuilding an old commit can fetch newer CMS content. No public CI webhook or automatic deployment is configured.

## Backup and isolated restoration

```powershell
npm run cms:backup
```

Set `CMS_BACKUP_DATABASE_URL` to a private login permitted to read CMS tables, including drafts. The command exports a repeatable-read content/metadata snapshot plus checksum-verified image bytes into ignored `backups/`. Keep that directory in private protected storage. Accounts, sessions, passwords, credentials, role grants, and schema ownership are excluded. Free instant-restore history is short, so it is not the only recovery copy.

To rehearse recovery, create a separate test branch with a schema-only database and separate branch storage. Do not reset or overwrite the working branch. In an ignored test environment file, supply its owner URL and the `CMS_RESTORE_DATABASE_URL` and `CMS_RESTORE_STORAGE_*` settings, then run:

```powershell
node --env-file=.env.restore.local scripts/cms-setup.mjs --schema-only
node --env-file=.env.restore.local scripts/cms-restore.mjs backups/<backup-directory> --confirm-empty-test-target
```

The restore command refuses the source database endpoint, the source storage endpoint, and nonempty CMS tables. It validates metadata and file checksums before writing, inserts inside a transaction, and uses conditional object creation. A failed upload/database restore can leave unreferenced test-bucket objects; inspect the isolated test bucket before retrying. Re-enroll an owner separately if the test branch has different authentication.

Compare all content, IDs, order, draft/published separation, image checksums, and the resulting private static export. Record the actual rehearsal date and outcome here only after performing it. Current live backup/restore verification remains pending account access.
