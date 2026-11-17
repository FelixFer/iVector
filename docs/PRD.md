# Product Requirements Document (PRD)
## iVector Lab Website

- **Product:** iVector Lab Official Website
- **Institution:** National Dong Hwa University (NDHU)
- **Department:** Computer Science and Information Engineering (CSIE)
- **Status:** Initial requirements baseline
- **Version:** 1.1
- **Last updated:** 2026-11-09

## 1. Product Overview

The iVector Lab website is the laboratory's public academic presence. It communicates the laboratory's identity, research directions, projects, people, and publications. It also provides a distinctive interactive Virtual Lab experience.

The [iVector Lab Figma file](https://www.figma.com/design/KiOg0xcdcWUPhjAXnMEOoB/iVector-Lab?node-id=0-1) is the desktop visual reference. The linked canvas contains these seven 1280 px frames:

- [Home](https://www.figma.com/design/KiOg0xcdcWUPhjAXnMEOoB/iVector-Lab?node-id=1-2051)
- [About](https://www.figma.com/design/KiOg0xcdcWUPhjAXnMEOoB/iVector-Lab?node-id=1-2490)
- [Research](https://www.figma.com/design/KiOg0xcdcWUPhjAXnMEOoB/iVector-Lab?node-id=1-4670)
- [Projects](https://www.figma.com/design/KiOg0xcdcWUPhjAXnMEOoB/iVector-Lab?node-id=1-4512)
- [People](https://www.figma.com/design/KiOg0xcdcWUPhjAXnMEOoB/iVector-Lab?node-id=1-3379)
- [Publications](https://www.figma.com/design/KiOg0xcdcWUPhjAXnMEOoB/iVector-Lab?node-id=1-3929)
- [Virtual Lab](https://www.figma.com/design/KiOg0xcdcWUPhjAXnMEOoB/iVector-Lab?node-id=1-4803)

Use the [design system](DESIGN_SYSTEM.md) for the approved narrow-screen Virtual Lab behavior and the [content guidelines](CONTENT_GUIDELINES.md) to verify any copy shown in the frames before publishing it.

## 2. Goals

1. Establish a professional online presence for iVector Lab.
2. Help visitors understand the laboratory's academic identity and research.
3. Make projects and publications easy to discover.
4. Introduce laboratory members using verified information.
5. Provide consistent navigation across the website.
6. Create an interactive Virtual Lab that links to relevant website sections.
7. Support desktop, tablet, and mobile visitors.

## 3. Target Users

- Prospective graduate and undergraduate students.
- Current students and laboratory members.
- Academic researchers and faculty.
- Potential academic or industry collaborators.
- General visitors interested in the laboratory.

## 4. Scope

### 4.1 In Scope

- Seven primary pages: Home, About, Research, Projects, People, Publications, Virtual Lab.
- Shared navigation and footer.
- Research-area presentation.
- Project directory with external links.
- People directory.
- Publication archive.
- Single-page interactive Virtual Lab.
- Responsive design.
- Basic accessibility and SEO.
- Structured, maintainable content data.

English is the sole launch language.

### 4.2 Out of Scope for Initial Release

- News & Events page or feed.
- Public visitor accounts, authentication, or user dashboards. The approved staff CMS below is separate.
- Payments or e-commerce.
- Page builders or unrestricted content/layout management. The approved academic editor below is separate.
- Multiplayer game functionality.
- RPG mechanics, quests, levels, points, or inventory.
- Complex backend services unless a later requirement establishes a need.

## 5. Sitemap

| Page | Primary purpose |
|---|---|
| Home | Introduce the laboratory and highlight selected content |
| About | Explain the laboratory's identity and environment |
| Research | Present research directions |
| Projects | List projects and related resources |
| People | Introduce verified laboratory members |
| Publications | List academic publications |
| Virtual Lab | Provide an interactive visual navigation experience |

News & Events must not appear in navigation, footer, homepage, or sitemap.

## 6. Functional Requirements

### FR-01 — Global Navigation
- Visitors can navigate to all six standard content pages.
- The active page is visually identifiable.
- The Virtual Lab control opens the Virtual Lab page.
- Navigation is usable on desktop and mobile.
- All navigation items work with keyboard input.

### FR-02 — Global Footer
- Display laboratory and institutional identification.
- Provide links to relevant website pages and verified academic resources.
- Display only confirmed contact and institutional information.

### FR-03 — Home
- Present the laboratory name and concise introduction.
- Provide Enter Virtual Lab and Explore Research calls to action.
- Preview research areas and selected projects when verified records are available.
- Include a concise About section.
- Avoid unsupported metrics and repetitive content.

### FR-04 — About
- Present the laboratory's background and identity.
- Present Vision & Mission only when official or approved content is available.
- Explain research philosophy only using verified information.
- Show real laboratory or campus imagery when supplied.

### FR-05 — Research
- Present verified research areas.
- Each entry includes a title and concise description.
- Optional category labels may be used.
- Use a clean vertical editorial list.

### FR-06 — Projects
- Present projects in a compact vertical list.
- Each record may include title, subtitle, description, year, category, and external resource links.
- External links must point to valid destinations.

### FR-07 — People
- Group verified members by appropriate academic role.
- Member profiles may include name, role, image, research interests, email, and personal website.
- Hide incomplete optional profiles rather than inventing details.

### FR-08 — Publications
- Present publication title, authors, venue, year, and paper link when verified.
- Group by year when useful and when records support it.
- Do not generate fictional citations or identifiers.

### FR-09 — Virtual Lab
- Present one cohesive, top-down 2D pixel-art laboratory scene.
- Include clickable destinations for Research, Projects, People, and Publications.
- Scene destinations have accessible names, visible focus states, and support mouse, keyboard, and touch.
- Support a playable pixel character at every width, using arrow keys/WASD while the scene is focused and 44 px directional touch controls. Keep four direct destination links below the scene, including without JavaScript.
- Move at 36 scene units/second with equal diagonal speed. Focus the scene once on arrival without scrolling, unless the visitor has already focused another control. Tab leaves normally and does not trigger refocusing.
- Provide connected doorways and collision with walls, furniture, and guide footprints. Restore valid same-tab session position/facing; otherwise start in the central corridor.
- Provide a 24-unit-wide vertical corridor, 16-unit-high horizontal corridor, and doorways at least 16 units wide. Show readable room-name signs and a nearby E to talk prompt (Tap guide to talk on touch devices).
- Include one stationary fictional website guide per room. Visitors can activate its button directly or press E within 12 scene units. A modal offers navigation guidance, an explicit destination link, and Close; Escape dismisses and restores focus.
- Walls block guide interaction: hide nearby prompts and Talk actions, ignore E, and disable direct NPC activation when a wall crosses the player-to-guide line. Open doorways permit interaction. Direct page links remain available.
- Provide a visible Back to Website link to Home.
- Playable exploration supports navigation without RPG systems, progression, or automatic page transitions. Stop movement on focus loss, cancellation, tab switching, and dialogue opening; respect reduced motion.

### FR-10 — External Links
- Links must have valid destinations.
- External destinations should be identifiable to visitors.
- Email links must use verified addresses.
- Do not render fake or placeholder URLs as functional links.

## 7. UI/UX Requirements

- Follow `DESIGN_SYSTEM.md`.
- Maintain a minimalist academic visual identity with restrained pixel-art influence.
- Use consistent navigation, footer, spacing, typography, and interaction states.
- Prioritize readable content and clear hierarchy.
- Keep the standard pages relatively restrained; the Virtual Lab may be more visually playful.
- Treat subtle animation and micro-interactions as explicit UX requirements. Follow the [audited motion plan](MOTION_PLAN.md): document target, trigger, effect, duration/easing, accessibility, performance impact, and P0/P1/P2 priority before implementing an effect. Preserve useful existing motion and avoid duplicate effects.
- New hover color/border transitions should use 150–250 ms, with immediate focus indicators and equivalent keyboard/touch usability. Nonessential motion respects reduced motion; content and navigation must never wait for animation.

## 8. Non-Functional Requirements

### Responsiveness
Support desktop, tablet, and mobile layouts without horizontal overflow.

### Performance
Optimize images, avoid unnecessary dependencies, minimize layout shifts, and use efficient rendering patterns.

### Accessibility
Use semantic HTML, keyboard-accessible interactions, visible focus states, adequate contrast, meaningful alt text, and reduced-motion support.

### SEO
Provide page-specific titles and descriptions, semantic heading structure, and social sharing metadata.

### Maintainability
Use reusable components, centralized content data, consistent naming, and documented setup and release workflows.

## 9. Content Requirements

All academic and institutional information must be accurate and approved. Never fabricate research topics, projects, people, publications, awards, collaborators, contact information, or laboratory history.

Use development placeholders only when clearly marked and prevent them from appearing as factual public content.

Keep development-status notices out of visitor-facing pages. Hide missing Home and About copy while retaining verified identity. Empty directories use the [plain messages](CONTENT_GUIDELINES.md#8-placeholder-policy), without notice containers. Content gaps are tracked internally.

Before launch, the lab content approver must confirm the [minimum content and any empty-state exceptions](CONTENT_GUIDELINES.md#9-launch-content-and-sign-off).

## 10. Acceptance Criteria

The initial release is accepted when:

- All seven pages exist and are reachable.
- The six standard pages share consistent navigation and footer.
- The Virtual Lab is reachable and has a working return path.
- Visual QA is complete against the approved Figma reference.
- Typography and color usage are consistent.
- All pages adapt to desktop, tablet, and mobile.
- The lab content approver has signed off on the minimum content and any directory empty states.
- External links work and have meaningful destinations.
- All four Virtual Lab destinations and the Home return link are discoverable and operable by touch and keyboard, including on narrow screens.
- Keyboard navigation and visible focus states work.
- No News & Events content appears.
- No fabricated academic information is published.
- Relevant build, lint, type-check, and test commands pass.

## 11. Future Enhancements

Potential future work, not required for the initial release:
- CMS expansion beyond the approved academic editing scope.
- Publication search and filtering.
- Additional languages beyond the confirmed launch scope.
- More advanced Virtual Lab interactions.
- Analytics integration.
- Additional approved laboratory media and animations.

## 12. Open Questions

| Decision or input | Responsible role | Needed before |
|---|---|---|
| Named content approver, verified source material, and any exceptions to the launch content minimum | Project owner to name the approver | Launch |
| Production host and domain | Project owner | Launch |

The project owner approved Virtual Lab artwork on 2026-11-13. Academic content sign-off remains separate.

## P2 approved discovery and atmosphere requirements

Directory filters: Research category, Projects category/year, People role, Publications year. Render a facet only when at least two supplied values exist. Combine selections, provide Reset filters and polite result counts, hide empty role groups, and preserve full server-rendered lists without JavaScript. No search.

Records can carry optional relatedIds pointing to explicitly approved academic relationships. Derive reverse links, validate targets and expose stable anchors; reveal filtered anchor destinations. No inferred authorship or invented content.

Atmosphere defaults to Manual Day. Visitors can choose Day/Night or opt into Automatic (Asia/Taipei, Day 06:00–17:59). Persist explicit preferences; fallback to Manual Day for invalid/unavailable storage. Change decorative Home/Virtual Lab art only, instantly, preserving scene geometry and interaction.

Full-site Day/Night mode applies to all seven pages and 404, preserving Manual Day default, saved choices and existing Automatic schedule. Picker must anchor to its trigger rather than the viewport edge; public label is Automatic.

## Approved academic CMS requirements

The owner requested a same-site protected `/dashboard/` backed by Neon's Free tier. One iVector account edits Home/About copy, Research, Projects, People, and Publications, including supplied photographs and explicit relationships. Global identity, SEO configuration, navigation, guides, artwork, motion, and game geometry remain in code. No public visitor accounts or page builder are added.

Managed authentication and immutable account-ID authorization protect every backend operation. Drafts and published versions/order remain separate. Preserve existing public types/anchors and the seven-page static export. Publishing updates CMS data; private builds and a separate deployment publish that data to visitors. Public CI uses local approved records without CMS credentials or draft artifacts. Requirements and acceptance details are in CMS_HANDOFF.md.

## Light the Lab

Approved extension: a daily 4 × 4 cable puzzle in a native modal on /virtual-lab/, launched by the glowing Projects desk lamp or labeled button. Includes public daily personal-best Top 5 and authorized staff score hiding. See GAME.md for rules, anonymous identity limitations, API and activation.
