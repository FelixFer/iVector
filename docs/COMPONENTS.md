# Reusable Component Specifications

## 1. Principles

Components should be reusable where the same behavior or visual pattern appears more than once. Avoid creating abstractions for one-off elements that do not benefit from reuse.

Use semantic HTML and typed props where supported by the stack.

## 2. Global Components

### SiteHeader
Responsibilities:
- Display laboratory identity.
- Provide primary navigation.
- Indicate the active route.
- Provide responsive mobile navigation.
- Link to the Virtual Lab.

### SiteFooter
Responsibilities:
- Display verified laboratory and institutional details.
- Provide useful internal and external links.
- Display copyright information.

### PageContainer
Responsibilities:
- Provide consistent page width and horizontal gutters.
- Maintain responsive padding.

### PageHeading
Responsibilities:
- Display optional eyebrow label.
- Display page title.
- Display concise introduction.

### SectionHeading
Responsibilities:
- Display a section title and optional supporting text.

## 3. Content Components

### ResearchAreaItem
Suggested content:
- Area number or label.
- Title.
- Short description.
- Optional category tag.

Prefer the vertical editorial pattern on the Research page.

### ProjectItem
Suggested content:
- Project title.
- Optional subtitle.
- Short description.
- Optional year and category tags.
- Valid external links.

### PersonProfile
Suggested content:
- Name.
- Academic role.
- Optional supplied image.
- Optional verified research interests.
- Optional verified email and website.

### PublicationItem
Suggested content:
- Publication title.
- Authors.
- Venue.
- Year.
- Valid paper link.

## 4. UI Components

### Button
Variants:
- Primary.
- Secondary.
- Text/link style.

All buttons must have a meaningful action and visible hover/focus states.
Use the shared `.button` and `.button-secondary` styles: square corners, 44 px minimum height, dark blue primary and bordered neutral secondary surfaces.

### Tag
Use for short category labels and metadata. Do not use as a replacement for descriptive text.

### ExternalLink
- Communicate that the destination is external where appropriate.
- Use a valid URL.
- Use safe target and rel attributes when opening a new tab.

## 5. Virtual Lab Components

### VirtualLabScene
Displays one cohesive top-down 2D pixel-art environment.

### VirtualLabObject
Represents an interactive object with:
- Accessible name.
- Destination.
- Position/size.
- Hover and focus state.
- Optional tooltip.

Use shared guide data for the four direct links and dialogue actions. The playable scene includes one visitor and four stationary guides, with 44 px native NPC buttons and directional controls. Dialogue traps focus, supports Escape, and restores its initiating control. Walking is optional; direct links remain in server-rendered HTML.

### VirtualLabInstructions
Displays a short instruction such as "Click an object to explore."

### BackToWebsite
Returns visitors to the main website, preferably Home.

## 6. Accessibility

- Prefer `<a>` for navigation and `<button>` for actions.
- Do not rely on hover alone; support focus and touch.
- Provide accessible names for icon-only controls.
- Ensure tooltips are not the only way to understand an action.
- Maintain visible focus indicators.

## 7. Visual Consistency

Follow `DESIGN_SYSTEM.md`. Components should not introduce their own unrelated colors, fonts, radii, or shadows.
