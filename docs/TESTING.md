# Testing and Quality Assurance

## 1. Purpose

Verify that the website works correctly, follows the design system, remains responsive, and does not publish fabricated information.

For the motion refinement in progress, follow the [per-effect animation specification and acceptance checks](MOTION_PLAN.md). Test finite automatic motion, hover/focus/touch parity, live reduced-motion changes, no replay, immediate native dialogue semantics, and performance recordings in addition to still screenshots. Integrated checks for the current pass are pending; earlier pass results below describe earlier builds.

## 2. Functional Tests

### Navigation
- Every navigation item opens the correct page.
- Active navigation state is correct.
- Mobile menu opens, closes, and navigates.
- Footer links work.
- Back to Website returns from Virtual Lab.

### Home
- Hero CTAs navigate correctly.
- Research previews link to Research.
- Project previews link to Projects or valid external resources.

### Research
- Research entries display correct verified data.
- Optional category tags do not overflow.

### Projects
- Project records display correct fields.
- External links open valid destinations.
- Missing optional fields do not create broken layouts.

### People
- Only verified members appear.
- Email and personal website links work.
- Missing optional images have a graceful fallback.

### Publications
- Titles, author order, venue, and year are correct.
- Paper links work.
- Year grouping is correct when used.

### Virtual Lab
- Research object navigates to Research.
- Project object navigates to Projects.
- People object navigates to People.
- Publication object navigates to Publications.
- Objects work with mouse, keyboard, and touch.
- Tooltips or accessible labels identify destinations.
- At a narrow mobile viewport, find and open each of the four labeled destinations and the Back to Website link using touch and keyboard alone. Check visible focus and confirm the return link opens Home.

## 3. Responsive Tests

Check representative widths for:
- Large desktop.
- Laptop.
- Tablet portrait and landscape.
- Narrow mobile.
- Common mobile viewport sizes.

Verify:
- No horizontal overflow.
- Navigation remains usable.
- Text is readable.
- Images scale correctly.
- Grids reflow correctly.
- Virtual Lab interactions remain usable.

## 4. Accessibility Checks

- Logical heading hierarchy.
- Keyboard navigation.
- Visible focus states.
- Accessible names for controls.
- Meaningful image alt text.
- Normal-sized text has at least 4.5:1 contrast against its rendered background, including secondary text and labels.
- Reduced-motion support.
- No hover-only functionality.

## 5. Content Verification

Before release, check:
- The named lab content approver has confirmed the [launch content minimum and any directory empty states](CONTENT_GUIDELINES.md#9-launch-content-and-sign-off).
- Research descriptions against approved information.
- Project names, years, and links.
- Member names, roles, and images.
- Publication titles, authors, venues, years, and links.
- Institutional contact details.
- No visible placeholder content.
- No invented achievements or claims.

## 6. Technical Checks

Run `npm run lint`, `npm run typecheck`, `npm run build`, then `npm test`. The Playwright suite serves `out/` and checks direct route loads, missing URLs, responsive behavior, keyboard and touch interactions, and automated accessibility in Chrome.

Virtual Lab tests cover collision geometry, all four doorway routes, normalized diagonal speed, proximity and room detection, input cancellation, dialogue focus containment/restoration, repeated dialogue opening, touch movement, reduced motion, and navigation without JavaScript. Review the scene at 320, 767, 768, 896, and 1280 px. Touch is emulated in Chrome; physical-device and other-browser checks remain separate.

Check automatic focus on both direct loads and navigation from Home without scrolling. Delay hydration to verify that a visitor's existing control focus is preserved. Check minimum 12 px room signs against NPC hit areas at all five widths, immediate keyboard movement, nearby desktop/touch prompts, and that Tab never restarts movement.

Test guide visibility across horizontal/vertical walls, wall corners, and open doorways. From within talking range across a wall, verify no prompt or Talk action, ignored E, and disabled NPC click/tap activation. Walk through the doorway and verify interaction becomes available.

Run the available project commands for:
- Linting.
- Type checking.
- Unit tests.
- Integration or end-to-end tests.
- Production build.

Do not report a check as passed unless it was executed successfully.

## 7. Visual QA

Compare the desktop implementation with the [linked Figma frames](PRD.md#1-product-overview) and use the project owner's approved layout for the narrow-screen Virtual Lab. Review the following:
- Color palette.
- Typography.
- Header and footer.
- Page width and gutters.
- Section spacing.
- Hero composition.
- Research list.
- Project list.
- Virtual Lab scene and narrow-screen layout.

Record significant deviations and either correct them or document an approved reason.

P1 checks cover live system reduced motion, invalid/blocked storage, position restore, entrance reset and collision walking feedback. Legacy navigation scenarios clear the session-position key on each load to preserve a fresh-entry fixture.


## P1 extension verification

Lint, TypeScript and static production export passed. Final full browser suite passed 31 tests. Responsive checks covered all seven routes at 320, 767, 768, 896 and 1280 px. Axe checks covered all seven pages and 404. New tests cover reduced-motion decorative accents, one-shot completion/system-preference changes, clipboard success and rejection with mailto preserved. Desktop/mobile screenshots were reviewed.

Anti-Slop delivery gate: Hard Gate PASS (responsive overflow assertions, axe, factual empty states and supplied member records); Purpose Gate PASS (small page-specific art identifies sections, reserved dimensions prevent shifts, existing tokens preserve identity); Liveliness PASS (ENERGY 2 / RHYTHM 2 / MOTION 1, stationary reading content, brief once-only accents); Craft PASS (production build, native clipboard failure feedback, keyboard/touch/navigation suite, rendered review). No new dependencies. Physical-device testing and public deployment remain unverified.

Animation-control removal: regression coverage verifies no animation buttons on Home or Virtual Lab, ignores legacy manual-pause storage, and responds live to system reduced-motion changes.

## P2 verification

Lint, TypeScript and the static production export passed. The full suite passes 53 tests, covering directory facets and AND rules, People group/reset/focus behavior, anchor reveal including repeated fragments, no-JavaScript records, explicit relationship validation and reverse links, additive/versioned CMS schema updates and conflicts, Manual Day default, remembered Night, Taiwan-time boundaries and optional Automatic mode, tab sync, blocked storage, and unchanged scene movement/dialogue.

Day and Night layouts were checked across all seven routes at 320, 767, 768, 896 and 1280 px. Axe checks cover all seven Day pages at 320/1280, plus Night Home/Virtual Lab at those widths. Screenshot evidence is in test-results/ (regenerated by npm test). Hover/focus checks verify stationary link boxes, visible focus, stronger email underlines and reduced-motion transforms. New SVG viewBoxes match the original artwork.

Anti-Slop delivery gate: Hard Gate PASS (overflow assertions and axe checks, verified seed records, no filler or dead controls); Purpose Gate PASS (documented rationale for artwork-only palettes and navigation feedback); Liveliness PASS (ENERGY 2 / RHYTHM 2 / MOTION 1, quiet feedback and stationary reading areas); Craft PASS (production export, 53 tests, native accessible controls, rendered desktop/mobile review).

No live CMS schema migration, physical-device test, or public deployment was performed. Related links appear only after approved relationships are supplied; empty directories remain empty.

## Global atmosphere switch verification

Production build and TypeScript passed; full browser suite passed 56 tests. Header checks cover every primary route and 404, exactly one switch, no inline duplicates, keyboard selection/Escape restoration, outside dismissal, Automatic-to-Manual switching, 44 px touch targets and reduced motion. Responsive checks cover 320, 767, 768, 896, 1152 and 1280 px. Open picker passed axe and viewport-clipping checks; desktop/mobile screenshots were reviewed. Anti-Slop gates PASS: Hard (axe/overflow/navigation tests), Purpose (global discoverability and preserved reading area), Liveliness (140 ms stepped thumb and stationary targets), Craft (56 tests and rendered review). Physical-device testing and deployment remain unverified.

## Full-site Night verification

Lint, TypeScript and production export pass. Final suite passes 59 tests. Night axe checks cover all seven routes plus 404 at 320/1280; computed semantic contrast checks require 4.5:1 for text/link/button pairs and 3:1 for control boundaries. Pre-body theme detection verifies saved Night is applied before hydration. Picker bounds are checked against its button at 320, 767, 768, 896, 1152, 1280 and 1920 px; scrolling away dismisses it. Existing movement timing test now waits for browser visibility initialization before synthetic input.

Anti-Slop delivery gate PASS: Hard (axe, overflow and measured contrast); Purpose (separate surface/button/art tokens and anchored picker); Liveliness (warm charcoal identity, restrained existing motion, native pixel icon); Craft (59 tests, production build and rendered desktop/mobile dark review). No deployment or physical-device testing.

## Revised motion acceptance (verification pending)

Replace the old tests/motion.spec.ts 16-second duration check. Assert four SVG-coordinate-unit travel over a single four-second steps(4, end) run, visible start/final positions, animationend completion, and consumption on viewport exit, hidden tab, Night, or live reduced motion. Initial reduced motion must consume without playing; returning/re-enabling motion must not restart until a fresh Home mount. Test About entrance independently of cloud state and skip for focus/fragment access. Dialogue opening may decorate only the shell/backdrop; text/buttons remain stationary and Close/Escape/focus restoration stay immediate.

Test the temporary palette-change flag for Manual, Automatic and cross-tab changes, rapid updates, and subsequent restored hover transitions. Selected/active/pressed states and focus indicators remain immediate. Review both themes, reduced motion, no JS, recordings and performance traces. No verification outcome for this pass is claimed here.

## Cozy motion refinement verification

Lint, TypeScript and production export passed. Full browser suite passed 67 tests. Assertions cover exact four-second/four-SVG-unit completion, visible final cloud bounds, cancellation/no restart for offscreen/hidden/Night/reduced motion, independent About entrance and direct anchors, immediate palette commits with restored 180 ms hover timing, and existing native dialogue/movement behavior. Day/Night, no-JavaScript, reduced motion, keyboard/touch and responsive checks remain in the suite.

Desktop/mobile WebM recordings, screenshots, Playwright traces and Chrome performance traces are in test-results/motion-refinement-motion-r-59ebe-mobile-interaction-evidence/. Performance captures cover load, cloud, scrolling and movement: 39/40 layout events overall, maximum 36.65/26.61 ms at desktop/mobile; only two layout events in the +1 to +3 second cloud interval, rather than per-frame layout. This is a local trace review, not a cross-device performance guarantee.

Anti-Slop delivery gate PASS: Hard (accessibility/contrast/overflow/regression tests), Purpose (shared feedback and bounded independent effects), Liveliness (cozy pixel sequences retained, stationary reading/buttons), Craft (67 tests, rendered video-frame review and trace inspection). No deployment or physical-device testing.

## Neon CMS acceptance

Run `npm run lint`, `npm run typecheck`, `npm run build`, and the full browser suite. Normal CI uses local approved records only. Test the dashboard shell without configuration, accessible form labels/focus and both themes at mobile/desktop widths. Exercise managed login, wrong credentials, logout, expired sessions and recovery with a securely activated test account; never hardcode real credentials or add a shipped test-login bypass.

API tests cover missing/invalid/wrong-issuer tokens, unapproved user IDs, denied origins, malformed content, revision conflicts, draft/publication isolation, required Home/About, protected references/deletion, and raster upload metadata/limits. Publication tests use isolated fixtures and preserve current public types/anchors. Check that no private fields or configuration appear in public output.

For live acceptance, use an isolated branch: create/edit/reorder records, exercise each content form and image upload, publish/unpublish, verify local private `cms:check`, `cms:build`, and `cms:verify`, then restore a private backup into a different empty test endpoint and compare content/media. Check the resulting export without Neon network access. Do not publish generated test academic records to the working branch. Keep authenticated screenshots/recordings private. Record actual results separately; live account activation and restore rehearsal are not implied by local passing tests.
