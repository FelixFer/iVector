# Micro-interactions and animation plan

Status: implemented and verified locally on 2026-11-16. Source audit below records the pre-refinement baseline; final verification is recorded in docs/TESTING.md.

## 1. Purpose and priorities

Keep the academic site cozy and responsive. Motion should clarify an action, orient the visitor, or give the pixel artwork a little life. Preserve the editorial lists, typography, Day/Night theme, functional navigation, and playable scene.

- **P0:** accessibility, reduced-motion behavior, focus visibility, immediate control feedback, cancellation behavior, and prevention of regressions. Complete before decorative polish.
- **P1:** consistent hover timing, arrow movement, interactive-row feedback, portraits, guides, and finite cloud refinement.
- **P2:** independent Home About-section and dialogue-opening treatments, after P0/P1 pass rendered review.

These are priorities within this motion pass, not replacements for the earlier project P0/P1/P2 milestones. Working methods: **Caveman** means concise progress/handoff; **Ponytail** means reuse existing components and make the smallest complete change without dependencies; **Anti-Slop** means review purpose, consistency, accessibility, and rendered quality during implementation. Keep ENERGY 2 / RHYTHM 2 / MOTION 1.

## 2. Pre-refinement motion audit

| Surface | Current behavior | Existing timing / easing |
|---|---|---|
| Shared buttons, navigation, menu summary | Background, border, and text color transitions; active navigation already uses `aria-current` and a sage surface | 140 ms, CSS default `ease`; focus outline immediate |
| Home directory | Surface/inset-edge highlight and 1 px arrow shift | 140 ms, `ease` |
| Home Enter Virtual Lab | Existing arrow compresses/reopens like a door | 300 ms, `steps(3, end)` |
| About actions | Existing arrows shift 1 px | Instant |
| Member portraits | Row hover/focus-within changes frame and sage surface | Surface 140 ms, `ease`; frame immediate |
| Resources, email, related links | Underline strengthens; color changes mostly immediate outside navigation | Mostly instant |
| Directory selects | Border feedback | 140 ms, `ease` |
| Atmosphere switch/picker | Thumb slides; picker/options have static hover and pressed feedback; popup and theme changes are immediate | Thumb 140 ms, `steps(3, end)` |
| Home cloud | Day-only clipped drift, hidden at Night; repeats while visible and foreground | 16 s, `steps(40, end)`, -4 s starting phase |
| Academic heading accents | Lamp warmth; sketchbook/monitor reveal; chairs/bookmark settle, once per visit | About 500 ms; Research/Projects/People 400 ms; Publications 350 ms; `steps(3, end)` |
| Player | Position updates through the existing movement controller; legs animate only during actual displacement | Legs 180 ms, `steps(2, end)`, alternating while walking |
| Guides | Nearby guide faces visitor; one greeting nod per guide per visit; static hover/focus sprite edge | Greeting 400 ms, `steps(2, end)` |
| Room entry | Research/Projects monitor wake and current-room outline | Monitor 400 ms, `ease-out`; outline 220 ms, `ease-out` |
| Dialogue | Native opening/closing, immediate text and focus handling | Immediate |
| Reading sections | No general page/section entrances | None |

Sources inspected: [shared motion](../src/components/motion.tsx), [global CSS](../src/app/globals.css), [Home CSS](../src/app/(academic)/home.module.css), [heading accents](../src/components/page-accent.module.css), [academic rows](../src/components/academic-page.module.css), [atmosphere](../src/components/atmosphere.module.css), and [Virtual Lab](../src/app/virtual-lab/virtual-lab.module.css).

Material gaps:

- Existing 140 ms control transitions fall below the newly requested 150–250 ms hover range. Standardize those interaction colors/borders to 180 ms; preserve intentionally stepped sprite and switch timings.
- Some global button/link/navigation and guide hover rules lack the fine-pointer guard already used by newer components. Add equivalent focus-visible and pressed feedback rather than relying on hover.
- Picker options change color immediately, and About arrows snap. Bring these into the shared interaction timing without adding a second effect.
- Native dialogue currently works immediately. Decorative opening motion must not introduce a delayed close, focus race, or invisible blocking layer. No exit animation is planned.
- The repeating cloud deserves a separate automatic-motion review. Reduced motion and offscreen suspension do not by themselves establish a visitor-operated pause mechanism. The proposed bounded alternative is specified below.

## 3. Animation specification

Each row defines the target for this implementation pass. **Retain** means reuse the existing effect, not add a duplicate. Verification remains pending until recorded in TESTING.md.

| ID / priority / disposition | Target | Trigger | Visual effect | Duration and easing | Accessibility | Performance impact |
|---|---|---|---|---|---|---|
| M01 · P1 · Tune | Shared buttons, selects, picker/options, actionable links | Hover, focus, press | Subtle background/border/text-color change; pressed surface immediate; no movement of hit targets | Colors/borders 180 ms `ease-out`; pressed state 0 ms | Fine-pointer hover only; equivalent focus/pressed feedback; focus outline immediate; reduced motion 0 ms | Small-area repaints, CSS only; name properties explicitly, never `transition: all` |
| M02 · P0 · Retain | Active navigation on all academic pages | Route changes | Existing active surface and `aria-current`; no traveling indicator | Active state 0 ms; hover color handled by M01 | Current page discernible without motion or hover; no delayed route/focus updates | No additional observer or animation loop |
| M03 · P1 · Normalize | Existing Home directory, About, and Virtual Lab destination arrows | Hover / keyboard focus; touch press | Existing icon shifts at most 1 px; text stays still | 160 ms `ease-out`; touch state immediate | Reduced motion keeps static color/border feedback; do not move focus outlines or touch areas | Transform on the icon only; no layout changes |
| M04 · P1 · Extend selectively | Research/project rows and publication records with actual resource/related links | Row hover / focus within | Faint theme-aware surface and border highlight; publication text stays stationary | 180 ms `ease-out` | No pointer cursor or fake whole-row action; passive rows receive no interactive styling; individual links remain the targets | Paint visible rows only; no animated shadows or mass elevation |
| M05 · P1 · Retain/tune | People portrait frames | Row hover / focus within | Existing outline and sage surface; no portrait zoom, tilt, or image movement | Surface 180 ms `ease-out`; outline 0 ms | Existing member links remain independently usable; touch gets link/button press feedback | Small portrait-area repaint; no image transforms |
| M06 · P1 · Retain | Home Enter Virtual Lab icon | Hover / focus | Existing three-frame door gesture | 300 ms `steps(3, end)` | Navigation remains immediate; reduced motion shows static icon; do not stack M03 onto this icon | Existing small SVG transform; no extra effect or client controller |
| M07 · P1 · Retain | Header atmosphere thumb | Day/Night activation | Existing sun/moon thumb step-slide | 140 ms `steps(3, end)` | Checked state and theme apply immediately; reduced motion swaps instantly; all targets remain at least 44 px | Existing transform; no whole-page theme fade or new popup animation |
| M08 · P1 · Bound automatic motion | Home daytime cloud | First eligible visible Day illustration per page visit | Replace the repeating long drift with one slow 4-unit drift inside the existing SVG window, then park visibly; retain cloud artwork and clipping | 4 s, `steps(4, end)`, once; integer scene-unit positions with crisp SVG edges | Initial reduced motion consumes the effect; static cloud without JS. Completion/interruption parks the visible final position; no restart after scrolling, tab, theme, or preference changes. Do not restore the removed Pause button | One existing decorative SVG transform; stop after completion; no new timer/RAF loop |
| M09 · P1 · Retain | Five academic heading illustrations | First eligible visibility per visit | Existing lamp/sketchbook/monitor/chair/bookmark sequence | Preserve 350/400/500 ms and `steps(3, end)` by variant | Decorative and pointer-transparent; skip when motion is suppressed; never conceal heading text | Reuse current visibility handling; bounded transform/fill work |
| M10 · P0 · Preserve | Virtual Lab character and direction buttons | Sustained keyboard/touch movement | Existing continuous controlled movement, responsive facing, actual-displacement leg steps, immediate pressed direction | Position follows current RAF controller, no interpolation delay; legs 180 ms `steps(2, end)` | Keep reduced-motion movement usable with static legs; preserve cancellation, collision, equal diagonal speed, and focus scope | Keep the single existing movement RAF; no CSS transition on `left`/`top`, no second game loop |
| M11 · P1 · Refine existing | Enabled guide buttons | Hover / focus / touch press | Clear stationary sprite-edge or footprint highlight; focus outline immediate | Supporting border/color 160 ms `ease-out`; focus and press 0 ms | Disabled/wall-blocked guides do not animate as available; accessible Talk action remains; do not replay the greeting on hover | Small local paint; use scene ink/paper tokens in both themes |
| M12 · P1 · Retain | Nearby unobstructed guide | First eligible proximity per guide per visit | Existing facing response and single 1 px greeting nod | Facing 0 ms; nod 400 ms `steps(2, end)` | Motion suppression skips the nod, not interaction; no automatic dialogue or repeated announcements | Existing sprite transform/state; no roaming NPCs or new proximity loop |
| M13 · P1 · Retain | Research/Projects screens | Entry into their room | Existing brief monitor-wake overlay | 400 ms `ease-out` | Decorative only; skip suppressed or missed sequences; never flash rapidly or change guide/navigation state | Existing small SVG opacity overlay; no new idle monitor loop |
| M14 · P1 · Retain | Current-room outline | Enter a different room | Existing quiet outline entrance | 220 ms `ease-out`; then static | Room status updates immediately; reduced motion shows the outline immediately; retain scene contrast | Existing opacity transition; no replays caused solely by returning to the tab |
| M15 · P2 · New, supporting content only | Home About-the-lab section | First eligible viewport entry per visit | One 2 px upward settle; keep content at full opacity throughout | 220 ms `cubic-bezier(.16, 1, .3, 1)` | Skip for reduced motion, no JS, or focus/fragment navigation into the section; eligibility is independent of the cloud; no replay or content gating | One section transform using existing visibility pattern; no scroll handler or row staggering |
| M16 · P2 · Opening only | Virtual Lab dialogue decorative shell/backdrop | Explicit open | Decorative shell settles by 2 px with subtle backdrop fade; text stays fully opaque and interactive buttons remain stationary. No closing effect | Open 160 ms `ease-out`; close 0 ms | Native `showModal()` opens immediately; `close()` and Escape dismiss immediately and restore focus. No exit/closing state, timeout, or animation-end dependency. Reduced motion and unsupported styling are immediate | CSS transform/opacity on decorative treatment only; no layout animation, discrete exit lifecycle, or library |

M08 intentionally changes a decorative effect, not a navigation interaction. Move exactly four SVG coordinate units within the 120 × 90 artwork, not four screen pixels. Begin visibly inside the window and keep the completed position visible; do not compress the old 40-unit traversal into four seconds.

Cloud lifecycle: one run per Home component mount. Start only when the Day illustration is visible, the tab is foreground, and motion preferences are known. A complete run lasts four seconds with one iteration; `animationend` marks completion and retains its final position. Leaving the viewport, hiding the tab, selecting Night, or enabling reduced motion while running cancels the run, parks the final position, and consumes it for that mount. Returning, switching back to Day, or disabling reduced motion never resumes/restarts it. Initial reduced motion consumes it without playback. A fresh Home mount or reload permits a new run. Static/no-JavaScript content remains visible. Additional environmental loops and a replacement Pause control are excluded.

M15 depends only on its own visibility, motion preferences, and focus/fragment eligibility. It may run while the cloud runs. No cross-effect scheduler or shared lock is permitted.

M16 is entrance-only polish. `showModal()` is the native modal-opening operation; `close()` is the native immediate dismissal operation. Focus handling must not wait for animation. No exit effect is included.

## 4. Shared implementation rules

- Centralize a small set of CSS timing/easing tokens for 180 ms control colors, 160 ms arrows, and 220 ms entrances. Preserve specialized sprite timings. Add no animation library or generic timeline framework.
- Keep controls, labels, citations, live result counts, copied-email messages, empty states, and route changes visible immediately. Do not animate record filtering, reorder rows with FLIP effects, or fade important content to zero.
- Keep native popover placement/dismissal and dialogue semantics intact. Do not transform the page/header or an anchor used to calculate popup placement.
- Each effect owns its lifecycle independently. Do not introduce a global one-animation-at-a-time rule, scheduler, or shared lock. Do not replay consumed effects after tab visibility, reduced-motion, or theme changes.
- Reuse the current motion provider and visibility helper. New cosmetic motion starts still until preferences are known, runs only while visible/foreground, and stops immediately on live reduced-motion changes. Missed one-shot effects are skipped, not queued.
- Preserve no-JavaScript content/navigation and static illustration states. Do not client-render entire academic pages to animate one supporting section.
- Use semantic, theme-aware tokens and maintain contrast during transitions. Keep focus outlines, selected controls, and active navigation immediate. Before Manual, Automatic, or cross-tab Day/Night commits, set a temporary root theme-change flag that makes color/background/border/shadow-color transition durations zero; clear it after the palette has painted so normal hover transitions return. Preserve separate transform timing for the atmosphere thumb. Rapid changes must not allow an older cleanup to remove a newer flag. Pre-paint preference loading stays immediate.
- Pixel sprites and environmental positions use crisp SVG rendering and integer scene-unit movement where possible; no fractional sprite scaling, blur, parallax, bounce, or idle character bobbing.
- Cosmetic animation never announces itself to assistive technology. Preserve existing meaningful room/dialogue/status announcements without per-frame updates.
- Do not add cards, content, shadows, icons, or controls solely to create places to animate.

Accessibility basis: W3C distinguishes [interaction animation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) from [automatically moving content](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Respect reduced motion for the former; separately assess duration/control for the latter. This plan adopts a bounded automatic cloud rather than claiming offscreen pausing alone resolves that concern. Dialogue opening uses an immediate static fallback; there is no discrete exit transition.

## 5. Implementation order and acceptance

1. **P0:** preserve accessibility, reduced motion, focus/touch parity, immediate states, cancellation behavior, native dialogue, and movement. Explicitly suppress palette interpolation during theme commits.
2. **P1:** standardize 180 ms hover timing; normalize arrows, contextual rows, portraits, guides, and finite cloud lifecycle. Retain heading artwork, monitor wake, room outline, and greetings rather than duplicating them.
3. **P2:** independently add the Home About-section settle and dialogue opening treatment. No cloud dependency or exit animation. Retain immediate fallbacks.

Required integration checks (pending this pass):

- Run lint, TypeScript checks, production build, and the full existing browser suite. Replace the original 16-second cloud assertion in `tests/motion.spec.ts` with exact four-unit displacement, four-second finite completion, visible final position, interruption/initial-reduced-motion consumption, and no resume/restart until remount.
- Verify mouse hover, keyboard focus/activation, touch press, disabled guides, copy success/failure, filters/anchors, popup dismissal/position, immediate dialogue close/Escape/focus restoration, stationary dialogue buttons, collision walking, and direction cancellation. Test About/cloud eligibility independently.
- Test reduced motion from initial load and while effects run. All cosmetic motion becomes absent while essential movement/navigation still work. Verify immediate Manual/Automatic/cross-tab palette changes, subsequent normal hover feedback, and rapid-toggle cleanup. Test no JS and missing optional content.
- Review all seven pages and the 404 in Day and Night at 320, 767, 768, 896, 1152, and 1280 px. Retain the existing 1920 px popup-alignment check. Include empty directories and test-only populated records; never publish fixture content.
- Confirm no focus outline delay, altered hit target, accidental horizontal overflow, clipped reveal, or motion-caused layout shift. Repeated pointer passes must not accumulate animations or greetings.
- Record a short desktop/mobile animation capture in addition to still screenshots, including default and reduced-motion states. Inspect a browser performance trace for the Home cloud and held Virtual Lab movement: no added per-frame React work, recurring layout measurement, or idle RAF from new effects. Color/fill changes may repaint their small targets; do not claim every effect is compositor-only.
- Update the design system, test guidance, and changelog with what actually shipped. This specification is not evidence that the effects or checks have passed; record actual integrated results separately.

Content, CMS activation, deployment, sound, and additional game systems remain outside this motion pass.
