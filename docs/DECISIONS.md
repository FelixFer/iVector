# Architecture and Design Decisions

Record accepted decisions here. Add new entries with a date, context, decision, and consequences. Proposed decisions should be labelled as proposed until approved.

## Neon academic CMS (2026-11-16)

- Status: Accepted by the owner.
- Decision: Replace the prepared Contentful integration with one Free Neon project and a protected `/dashboard/` in the existing static website. Use managed authentication, an immutable owner account ID, one authenticated Function, plain SQL, and private image storage. The account name is iVector; recovery uses the owner's supplied student email. The password is set privately.
- Consequences: Drafts are distinct from published content. Only private local builds read published Neon records and bundle their approved images. Public GitHub CI uses approved local seeds without remote CMS credentials. Publishing is separate from deployment. Shared-account edits cannot identify individual staff. Quotas and short free restore history require private backups and an isolated restore rehearsal.

## D-001 — Seven-Page Information Architecture

- **Status:** Accepted baseline
- **Decision:** The website has Home, About, Research, Projects, People, Publications, and Virtual Lab.
- **Context:** The current website concept requires a focused academic structure.
- **Consequences:** News & Events is excluded from navigation and page scope.

## D-002 — Visual Direction

- **Status:** Accepted baseline
- **Decision:** Use a minimalist academic design with subtle pixel-art influence, approximately 70% and 30% respectively as qualitative guidance.
- **Consequences:** Standard pages prioritize readability; the Virtual Lab can be more playful.

## D-003 — Typography

- **Status:** Accepted baseline
- **Decision:** Use self-hosted Pixelify Sans Bold for page and section titles. Use Plus Jakarta Sans for body copy, navigation, controls, metadata, and publication titles.
- **Consequences:** Do not introduce additional font families without a clear reason and approval.

## D-004 — Color Palette

- **Status:** Accepted baseline
- **Decision:** Use Warm Ivory, Powder Blue, Sage Green, Soft Lavender, Peach, Warm Beige, Soft Charcoal, and Muted Gray as defined in `DESIGN_SYSTEM.md`.
- **Consequences:** Avoid unrelated colors and dark neon visual styles.

## D-005 — Virtual Lab Interaction Model

- **Status:** Accepted baseline
- **Decision (updated 2026-11-13):** The Virtual Lab is one playable top-down 2D scene with a visitor character and four fictional room guides. Keyboard and touch movement are optional; direct links remain available without JavaScript. Guides offer navigation-only dialogue and never impersonate real lab members. The project owner approved the artwork.
- **Consequences:** No separate room pages, RPG systems, scores, quests, or character progression in the initial release.

## D-006 — Academic Content Accuracy

- **Status:** Accepted baseline
- **Decision:** Never invent research, project, publication, member, or institutional information.
- **Consequences:** Missing content must remain an editable placeholder during development or be omitted from public output.

## D-007 — Static Next.js Preview

- **Status:** Accepted
- **Date:** 2026-11-09
- **Context:** The first milestone is a locally reviewable English-language site with a portable build.
- **Decision:** Use Next.js App Router, strict TypeScript, npm, CSS Modules, and static export.
- **Consequences:** Site content ships with each build. The production host and domain are selected after content sign-off.

## D-008 — P2 discovery and atmosphere

- **Status:** Accepted, 2026-11-16.
- **Decision:** Add relevant filters and explicitly supplied academic connections; exclude search and scene content objects. Default to Manual Day with visitor-controlled Day/Night, retaining Automatic Asia/Taipei as an opt-in. Scope atmosphere to decorative artwork.
- **Consequences:** Empty datasets do not gain filler or useless controls; links require verified relationships. Existing geometry, academic typography and ivory reading areas stay consistent.

## D-009 — Full-site Night theme

Accepted 2026-11-16: Day/Night now controls the entire UI as well as artwork. Manual Day remains the default; Automatic retains the existing schedule with a shorter visible label. Warm charcoal surfaces preserve the cozy academic identity.
