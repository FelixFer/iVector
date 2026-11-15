# Design System — iVector Lab

## 1. Design Intent

Create a minimalist academic website with a subtle pixel-art identity. The standard pages should feel professional, warm, readable, and editorial. The Virtual Lab may be more playful while retaining the same palette and visual language.

Target direction: approximately 70% minimalist academic and 30% subtle pixel-art influence.

## 2. Color Tokens

| Token | Hex | Intended use |
|---|---|---|
| `color-bg` / Warm Ivory | `#F7F5EF` | Main page background |
| `color-blue` / Powder Blue | `#DCE8F5` | Primary accent, selected states |
| `color-green` / Sage Green | `#DDEBDD` | Secondary accent, active navigation |
| `color-lavender` / Soft Lavender | `#E9DFF2` | Occasional decorative accent |
| `color-peach` / Peach | `#F5E3D4` | Small highlights |
| `color-border` / Warm Beige | `#E8E2D8` | Dividers and subtle surfaces |
| `color-text` / Soft Charcoal | `#343A40` | Primary text |
| `color-muted` / Muted Gray | `#59636D` | Secondary text |

Use the tokens consistently. Check contrast for all text/background combinations. Do not use the pastel accents as low-contrast text colors.

Muted Gray meets the [WCAG AA minimum contrast of 4.5:1 for normal text](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) on Warm Ivory, Powder Blue, Sage Green, Soft Lavender, Peach, and Warm Beige.

## 3. Typography

Use self-hosted Pixelify Sans Bold for page and section titles. Use Plus Jakarta Sans for body copy, navigation, controls, metadata, and publication titles.

### Suggested Desktop Scale

| Element | Size | Weight |
|---|---:|---|
| Home hero heading | 48–64px | 700 |
| Page title | 40–48px | 700 |
| Section heading | 28–32px | 600–700 |
| Card/list title | 18–22px | 600 |
| Body text | 15–17px | 400 |
| Navigation | 13–15px | 500 |
| Technical label | 10–12px | 400–500 |

Use responsive scaling on smaller screens. These are starting values; match the Figma reference where a clear value is available.

## 4. Layout and Spacing

- Use generous whitespace and consistent page gutters.
- Keep reading widths comfortable.
- Align section headings and content consistently.
- Prefer simple grids and vertical lists.
- Use thin borders and restrained shadows.
- Avoid excessive rounded cards and nested containers.
- Maintain consistent vertical rhythm.
- Avoid unnecessary full-width blocks of dense text.

Use the existing project's spacing scale if one exists. Otherwise define a small consistent scale and reuse it.

## 5. Borders, Radius, and Shadows

- Prefer thin Warm Beige borders.
- Use square corners for buttons, navigation tabs, menu controls, and Virtual Lab links. Keep subtle rounding on the scene container.
- Avoid heavy drop shadows.
- Use elevation only when it clarifies hierarchy.
- Keep card treatments consistent.

## 6. Buttons and Links

- Primary buttons: dark blue (`#284E6D`) with ivory text (`#FFFDF8`), darkening to `#173B59` on hover.
- Secondary buttons: neutral or lightly tinted surface with a clear border.
- Links: visually identifiable without relying only on color.
- Hover and focus states should be subtle but visible.
- Do not render decorative controls that do nothing.
- Use Sage Green for the active navigation tab, with `aria-current="page"`. Controls have a 44 px minimum height and visible keyboard outlines.
- Virtual Lab uses four compact pastel destination links below the scene at every width. NPC buttons have 44 × 44 px minimum hit areas and visible keyboard outlines; they do not cover entire rooms.
- Keep the stepped Home illustration frame as the main artwork accent; do not repeat it around content lists.

## 7. Imagery and Pixel Art

- Use supplied, approved laboratory and campus photographs for real-world claims.
- Pixel-art illustrations may depict generic workspaces, computers, books, diagrams, and furniture.
- Do not present generated imagery as a real photograph of the laboratory, campus building, or a real person.
- Keep pixel-art scale and visual style consistent.
- Avoid cyberpunk, neon, glow, and dark futuristic environments.

## 8. Motion

- Use short, restrained transitions for hover and focus states.
- Avoid continuous motion that distracts from content.
- Respect `prefers-reduced-motion`.
- Virtual Lab animations should be subtle and nonessential to navigation.

## 9. Responsive Rules

- Desktop: use full navigation and multi-column layouts where appropriate.
- Tablet: reduce gutters and adapt grids.
- Mobile: use a compact menu and single-column content where needed.
- Ensure touch targets are comfortable.
- Prevent horizontal scrolling.
- At every width, scale the Virtual Lab scene proportionally, preserve 44 px NPC and directional-button hit areas, and place direct destination links below it. Stack controls on narrow screens. Keep Back to Website near the heading.

### Playable scene

Keep the scene as the focal point. Blue identifies the visitor; muted blue, green, brown, and lavender clothing distinguish fictional room guides. Sprites use the scene's pixel scale. Walking animation runs only during input and is disabled with reduced motion. Dialogue uses existing ivory surfaces and typography, with immediate text and no entrance animation.

Design read: ENERGY 2 / RHYTHM 2 / MOTION 1. Movement serves exploration; the scene carries the visual identity while instructions, controls, and destination links remain plain.

Room-name signs use Plus Jakarta Sans at a minimum 12 px with pastel surfaces, reserving clear space above furniture and outside NPC hit areas. The corridor is 24 units wide vertically and 16 high horizontally in the 240 × 140 scene. Doorways are at least 16 units wide. Movement speed is 36 units/second. Focus the scene once on arrival with no scroll jump and preserve any control the visitor has already focused. Near a guide, show a noninteractive E to talk prompt beside the character; coarse-pointer devices show Tap guide to talk. Keep the full Talk button available below the scene.

## 10. Consistency Checklist

- Correct font family and weight.
- Consistent heading hierarchy.
- Consistent page gutters and section spacing.
- Consistent button styles.
- Consistent border and radius treatment.
- Correct use of pastel accents.
- Readable contrast.
- No unnecessary visual effects.

## P1 cozy motion

Home uses one 16-second pixel cloud, clipped inside the window. Shared controls use 140 ms color/border transitions; Home arrows shift 1 px. Research and Projects monitors wake for 400 ms on room entry. Nearby visible guides face the visitor and greet once per visit for 400 ms. Text and dialogue stay stationary.

Animation controls are automatic: system reduced motion suppresses cosmetic motion. There is no manual pause button or stored manual preference. Start still before reading preferences. Ambient motion pauses offscreen/when hidden. Cosmetic pauses do not disable user-controlled character movement.

Walking legs reflect actual displacement rather than held input. Blocked nearby guides show doorway guidance. Same-tab session position/facing are restored only if valid against current collision geometry. Return to entrance resets position and focus without scrolling.

## P1 page accents

ENERGY 2 / RHYTHM 2 / MOTION 1. Small heading illustrations distinguish the five academic directories without moving reading content. About uses a lamp/notebook (500 ms); Research sketchbook and Projects monitor use 400 ms reveals; People chairs settle over 400 ms; Publications bookmark settles over 350 ms. Reserved sizes are 96 × 72 px, or 80 × 60 px below 480 px. Accents sit below headings on phones. All art is decorative, generic, and pointer-transparent. Sequences run once on visibility and are skipped when paused; no missed animation replays. Existing pastel tokens and typography preserve visual continuity. Portrait outlines identify the active member row; copy feedback reserves inline space. Virtual Lab outlines the current room over 220 ms. Home cloud starts four seconds into its seamless loop so it is visible promptly.
