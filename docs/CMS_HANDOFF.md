# P0 CMS and private review handoff

## Status

Local implementation is ready for account activation. Git is initialized; remote creation/push, Contentful provisioning, account permissions, live API access, webhook delivery and backup restore are not yet verified. Both GitHub and Contentful require sign-in. No production site has been deployed.

## Verified seed content

The institutional identity and Assistant Professor Yu-Chieh Ho are supported by https://www.csie.ndhu.edu.tw/en/professors-en/ . The four master’s student records, nationalities, IDs and derived email addresses were supplied and approved by the project owner on 2026-11-15. Photos have not been supplied; initials are decorative fallbacks. No project, research, or publication records have been invented.

## Account activation

1. Sign into GitHub as FelixFer (or run `gh auth login` locally). Create **FelixFer/ivector-lab**, **private**, without README initialization. Add it as origin and push main after reviewing the initial commit.
2. Sign into Contentful and create a **Free** space with environment `master`, locale `en-US`. Do not accept a paid upgrade. Editors can publish on Free: use one designated publisher and human review; this is not permission-enforced approval.
3. Copy `.env.example` to `.env.local`, uncomment and supply all three delivery variables. Add a management token only locally for setup. Never paste tokens into chat, screenshots, logs, or public variables.
4. Run `npm run cms:setup`. It creates missing models and draft seed entries; existing models/entries are left untouched. Review the model and entries in Contentful before publishing. Project resource JSON uses an array of objects with `label` and HTTP(S) `href`.
5. Photo fields use native image assets. Supply `photoAlt`, `photoSource` (HTTP(S) source), and `photoPermission`; About uses `environmentPhoto`, members use `photo`. Publish referenced assets before entries. Images render square/cropped on People. Local assets keep their existing paths.
6. Publish Home, About and the five people entries. Add `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ENVIRONMENT`, `CONTENTFUL_DELIVERY_TOKEN` as private repository Actions secrets. The delivery token is read-only; no management token is required for builds.
7. Run the **Private review build** workflow manually and verify People order, images, all seven pages and the 404. PR checks use local approved content and never receive delivery secrets; main/manual builds use CMS when configured.

## Publish webhook

In Contentful, add a POST webhook for entry/asset publish and unpublish events, filtered to `master`. Do not trigger on draft saves. Target:

`https://api.github.com/repos/FelixFer/ivector-lab/actions/workflows/publish.yml/dispatches`

Use custom JSON body `{"ref":"main"}` and `Content-Type: application/json`, `Accept: application/vnd.github+json`. Store `Authorization: Bearer <fine-grained GitHub token>` as a **secret header**. Scope that token to this repository with Actions write only. GitHub authenticates the token; no custom signature-verification receiver is deployed. Rotate the token in Contentful when it expires.

Test a draft edit (no build), publish (build), unpublish (record removed), and an invalid entry (failed build with no successful static artifact). A build dispatch response confirms receipt, not a successful build; inspect Actions. Free usage quotas apply.

## Review and recovery

Successful Actions runs upload `static-review-<commit>` with `out/` contents and test evidence, retained seven days. Download and extract a successful artifact, then serve it with a static HTTP server. For the included preview script, place artifact contents inside `out/` and run `npm run preview`. Do not review by double-clicking HTML files.

For recovery, download an earlier successful artifact rather than rebuilding an old commit against newer CMS content. Failed builds do not replace earlier artifacts. There is no hosted staging URL or production deployment in P0.

## Content backup rehearsal

Use the official Contentful CLI export/import instructions: https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/

From a securely authenticated local CLI, export the selected space/environment with drafts and assets, skipping webhooks. Store exports in ignored `backups/` in private storage. Import a copy into a separate test environment and compare entry counts, student IDs/order, photo assets, and published content before relying on it for recovery. Never import over the working environment as a test. Export/import does not restore memberships or full version history. Actual backup/restore rehearsal remains pending account access.

## Configuration and failure behavior

With all delivery variables absent, the site uses the approved local records. Partial configuration, failed delivery requests, bad records, missing referenced images, or invalid image metadata fail the build. Only CDA published content is fetched; no Preview API or Management API credentials enter the public build. Research, Projects and Publications retain their agreed empty states.

## P2 optional connections

The four directory models accept relatedIds, an optional array of stable content ID strings (not display names or Entry links). The setup script adds this field to existing models using their current version and preserves all other definitions and entries. Reruns leave a compatible existing field untouched. Setup stops if a model has pending/unpublished schema edits or an incompatible relationship field; review and activate those edits before rerunning. Review schema compatibility before running against a live space. Entry publication still requires human review; setup does not publish entries. Broken/self references fail the site build. Remove inbound references before unpublishing a record. Live provisioning remains pending account access.
