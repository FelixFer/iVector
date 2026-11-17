# Application Architecture

## 1. Purpose

The site uses Next.js App Router, strict TypeScript, CSS Modules, and shared CSS tokens. Next.js generates a static export in `out/`. Build-time React components read local TypeScript data. The responsive site navigation is a small client component.

## 2. Architectural Principles

- Keep page composition separate from reusable UI components.
- Keep content data separate from presentation where practical.
- Use explicit types for structured content.
- Keep routing predictable.
- Avoid unnecessary global state.
- Keep dependencies minimal.
- Make interactive behavior accessible and testable.

## 3. Source Structure

```text
src/
├── app/
│   ├── (academic)/
│   └── virtual-lab/
├── components/
└── data/
```

## 4. Routing

Required page routes:
- Home: `/`
- About: `/about`
- Research: `/research`
- Projects: `/projects`
- People: `/people`
- Publications: `/publications`
- Virtual Lab: `/virtual-lab`

The static export uses trailing slashes and directory indexes. The local preview returns the generated `404.html` for unknown URLs.

## 5. Shared Layout

Standard pages should reuse:
- `SiteHeader`
- `MainNavigation`
- `PageContainer`
- `SiteFooter`

The Virtual Lab may use a simplified layout, but should preserve the brand identity and provide a return path.

## 6. Data Organization

Use `src/data/content.ts` for approved copy and directory records and `src/data/site.ts` for site identity and navigation.

Directory data includes:
- `researchAreas`
- `projects`
- `people`
- `publications`
- `navigationItems`

Use typed data structures. Example conceptual types:

```ts
type ResearchArea = {
  id: string;
  title: string;
  description: string;
  category?: string;
};

type Project = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  year?: number;
  categories?: string[];
  links: Array<{ label: string; url: string }>;
};

type Person = {
  id: string;
  name: string;
  role: string;
  image?: string;
  interests?: string[];
  email?: string;
  website?: string;
};

type Publication = {
  id: string;
  title: string;
  authors: string[];
  venue?: string;
  year?: number;
  url?: string;
  doi?: string;
};
```

These are structural examples, not actual laboratory records. Do not populate them with invented public-facing data.

## 7. Virtual Lab Architecture

Represent interactive objects as data where practical:
- Unique identifier.
- Accessible label.
- Destination route.
- Position and dimensions.
- Optional visual state or tooltip.

The page shell and metadata remain server components. `playable.tsx` is the isolated client controller; `scene-data.ts` holds typed guide dialogue, shared destination URLs, geometry, and pure movement/room/proximity functions. The SVG and collision rectangles share 240 × 140 coordinates. Collision uses the character's feet and substeps to prevent crossing obstacles. Movement uses requestAnimationFrame with normalized diagonal speed and capped elapsed time, without a game engine.

Native NPC buttons open one native dialog. Input is scoped to the focused scene or directional controls and cleared on release, blur, visibility change, cancellation, and dialogue opening. Position and facing are restored from validated same-tab session storage; Return to entrance resets them. Direct links render in the static HTML; no-JavaScript visitors retain navigation. Room changes use a status announcement; continuous positions are not announced.

Wall rectangles are shared between collision and player-to-guide line-of-sight checks. Nearby prompts require both the 12-unit range and clear sight. Direct NPC buttons and the dialogue handler also check sight, so clicks and taps cannot bypass walls. Doorway openings permit sight; furniture does not block conversations.

`movementSpeed` is shared by movement and browser-test timing. Initial focus runs once when the scene becomes interactive, uses preventScroll, and skips if a visitor has already focused a control. It never recaptures focus after Tab. The 24 × 16 corridor crossing, furniture transforms, and door openings match the SVG: upper furniture uses y × 0.8 + 10, lower furniture y × 0.65 + 43.35, leaving space for readable signs. Guide records also hold sign positions. The nearby prompt is pointer-transparent and CSS selects keyboard or coarse-pointer wording.

## 8. State Management

Use local component state for simple interactions such as mobile menu visibility, active tooltip, or Virtual Lab hover state. Add a state-management library only if real application complexity requires it.

## 9. Assets

- Store static public assets in the framework's public asset directory when appropriate.
- Keep imported component assets organized under the source asset directory.
- Use descriptive filenames.
- Avoid embedding large base64 images in source code.
- Document asset provenance and licensing.

## 10. Error and Empty States

- Handle missing optional images gracefully.
- Hide empty optional sections.
- Show a useful not-found page for invalid routes.
- Avoid broken external links.
- Do not display raw placeholder values to public visitors.

## 11. Security

- Never commit API keys, tokens, or secrets.
- Validate external URLs and use safe link attributes where needed.
- Avoid unsafe HTML injection.
- Keep dependencies updated and minimal.

## Published content loading

Academic pages call the server-side loadContent adapter at build time. Normal builds use approved local records. A private `cms:build` reads one repeatable-read snapshot from the restricted Neon published views, validates it, downloads only referenced images with checksum verification, and stages public-only content in ignored `.cms/snapshot.json` and `public/cms-assets/`. The Next build selects that snapshot explicitly with `CMS_CONTENT_SOURCE=neon`; invalid or unavailable CMS content fails instead of mixing in local records. The portable export includes its images and makes no visitor database requests.

`/dashboard/` is an exported, non-indexable client editor. Its HTML contains no private CMS records. Neon managed authentication owns passwords and sessions. A single Neon Function verifies JWT signature/issuer and the approved immutable account ID before content or image operations. The runtime SQL login has only CMS data privileges; migrations use a separate local owner login. The unused Data API stays disabled. Draft and published fields/order are separate; revision checks prevent silent overwrites and transactional publication validates the resulting complete public dataset. Home/About must remain published, and references block removal of their targets.

Images live in a private branch bucket. The authenticated Function validates raster uploads and supplies short-lived preview URLs. Build credentials stay local. Shared fields and public conversion live in `cms/model.ts`; the original academic data types and record anchors remain unchanged. See CMS_HANDOFF.md for activation, publishing and recovery.


## Page accents

AcademicPage accepts an optional typed accent variant. PageAccent and CopyEmail are small client leaves; page content and CMS loading remain on the server. Accents reuse useSceneMotion; copying uses the native Clipboard API with selectable mailto fallback. No dependencies or CMS fields added.

## P2 progressive discovery

DirectoryFilters is a client leaf around server-rendered records. Supplied facet metadata drives native selects; scoped native hidden states filter rows and empty groups. Controls mount after hydration; no-JavaScript records remain complete. Fragment navigation clears conflicting selections and reveals the record. Selection state stays in memory.

A shared record helper validates IDs/relationships and resolves explicit one-hop forward/reverse links and encoding-safe anchors. relatedIds is optional across all four directory types; names and publication authors are never matched automatically. The dashboard uses record pickers; SQL migrations preserve existing draft and published data.

A shared atmosphere provider stores Manual/Automatic and the last manual Day/Night choice. Runtime Taiwan time is used only for Automatic mode; hidden tabs suspend polling. Native SVG artwork keeps the original geometry and uses scoped palette variables. No new runtime services or dependencies.

The existing AtmosphereControls component now renders a header switch and native auto popover. SiteHeader covers academic routes/404; Virtual Lab mounts the same component in its separate header. Provider, preference format and Taiwan clock remain unchanged.

Full-site theme uses the existing data-atmosphere attribute and v1 preference format. A guarded head initializer reads validated saved state before body paint; the provider waits until initialized before applying its state. No new storage key or service. Native picker position is calculated only while open.

## Light the Lab

Approved extension: a daily 4 × 4 cable puzzle in a native modal on /virtual-lab/, launched by the glowing Projects desk lamp or labeled button. Includes public daily personal-best Top 5 and authorized staff score hiding. See GAME.md for rules, anonymous identity limitations, API and activation.
