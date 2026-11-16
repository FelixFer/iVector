# Product Roadmap

This roadmap is a planning baseline, not a promise of delivery dates. Priorities may change with the project owner.

## Phase 1 — Foundation

- [x] Set up Next.js and TypeScript.
- [x] Establish design tokens and typography.
- [x] Implement shared navigation and footer.
- [x] Set up routes for all seven pages.
- [x] Establish structured content data.
- [x] Link the seven desktop Figma frames in the PRD.
- [x] Confirm English as the launch language.
- [ ] Name the lab content approver and collect verified content and assets.

## Phase 2 — Core Academic Pages

- [x] Implement the Home, About, Research, Projects, People, and Publications pages.
- [x] Remove visitor-facing development notices and use plain directory empty states.
- [ ] Populate the pages with approved copy, records, and assets.
- [ ] Follow the [content phase](CONTENT_GUIDELINES.md#12-next-content-phase): collect the Home focus sentence, research directions, and member identity first, then project and publication records.

## Phase 3 — Virtual Lab

- [x] Create a pixel-art preview scene and link its four hotspots to the academic pages.
- [x] Add desktop hover and keyboard focus states.
- [x] Add the approved narrow-screen list and the return-to-website control.
- [x] Approve Virtual Lab artwork (project owner, 2026-11-13).
- [x] Add playable character movement, collision, four fictional room guides, and accessible dialogue while retaining direct navigation.

## Phase 4 — Quality and Release

- [x] Extend the approved Home and Research pixel treatment to shared controls and all four Virtual Lab destinations.

- [ ] Responsive QA.
- [ ] Accessibility QA.
- [ ] Content verification.
- [ ] External link verification.
- [ ] Performance and image optimization.
- [ ] SEO metadata.
- [ ] Production build and deployment verification.

## Future Enhancements

Potential enhancements after the initial release:
- [ ] Additional languages beyond the confirmed launch scope.
- [ ] Publication search and filtering.
- [ ] Content management system.
- [ ] Additional approved Virtual Lab interactions.
- [ ] Analytics, subject to privacy and institutional requirements.

## Priority Guidance

Prioritize correctness, responsive behavior, content integrity, and core navigation before decorative effects or advanced interactions.

## Planned motion refinement

See [MOTION_PLAN.md](MOTION_PLAN.md) for the source audit and per-effect specifications. These priorities are within the motion pass, distinct from earlier project milestones.

- [x] P0: accessibility, reduced motion, immediate focus/selected/pressed states, cancellation and movement/dialogue regressions; suppress palette interpolation during theme commits.
- [x] P1: consistent 180 ms hover timing, arrows, interactive rows, portraits, guides, and four-unit/four-second consumed cloud lifecycle; retain existing heading/room effects.
- [x] P2: independent Home About-section settle and 160 ms dialogue opening shell/backdrop treatment. No cloud lock or exit animation; immediate native dismissal/fallbacks.
- [x] Verify Day/Night, reduced motion, no JS, responsive layouts, motion recordings, and targeted browser/performance checks.

## P1 cozy interaction pass

- Automatic system reduced-motion preference, Home cloud, control transitions and monitor/guide feedback.
- Collision-aware walking feedback and visible blocked-guide guidance.
- Validated same-tab position restore and Return to entrance.
- Content-backed room objects remain deferred until verified directory records exist.

### P1 extension implemented locally

Five decorative heading accents, Home cloud phase and door gesture, member portrait focus/copy-email feedback, resource link feedback, and Virtual Lab current-room outline. Academic records and public deployment remain separate.

## P2 filters, connections and atmosphere

- Relevant directory facets with server-rendered no-JavaScript fallback.
- Explicit academic relatedIds and stable direct record links; no fabricated edges.
- Manual Day/Night default, optional Taiwan-time Automatic mode.
- Restrained hover/focus/pressed feedback and unchanged scene geometry.
- Search, scene content objects, live CMS activation and deployment remain deferred.
