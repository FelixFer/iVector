# AI Coding Agent Instructions — iVector Lab

## 1. Mission

Build and maintain the official iVector Lab website for the Department of Computer Science and Information Engineering (CSIE), National Dong Hwa University (NDHU), Hualien, Taiwan.

Treat the existing iVector Lab Figma design and the documentation in `docs/` as the project baseline. Implement requested changes without casually redesigning unrelated pages.

## 2. Read Before Working

Before making changes:
1. Read this file.
2. Read `README.md`.
3. Read `docs/PRD.md` and the relevant supporting documents.
4. Inspect the existing code, assets, routes, and package scripts.
5. Identify which files and pages the requested change affects.

Do not assume the implementation matches the documentation; inspect it and report meaningful discrepancies.

## 3. Product and Design Constraints

- The website has seven primary pages: Home, About, Research, Projects, People, Publications, and Virtual Lab.
- Do not add a News & Events page or section unless explicitly requested.
- Preserve the visual direction: approximately 70% minimalist academic design and 30% subtle pixel-art influence.
- Use self-hosted Pixelify Sans Bold for page and section titles. Use Plus Jakarta Sans for body copy, navigation, controls, metadata, and publication titles.
- Follow `docs/DESIGN_SYSTEM.md` for colors, typography, spacing, and component styling.
- Use warm ivory backgrounds, pastel accents, restrained borders, generous whitespace, and clear editorial hierarchy.
- Do not introduce cyberpunk styling, neon, dark futuristic backgrounds, excessive gradients, or decorative clutter.
- The Virtual Lab is a single-page interactive environment, not an RPG and not a set of separate room pages.

## 4. Content Integrity — Critical

Never fabricate academic or institutional information. This includes:
- Research topics and claims.
- Project titles, descriptions, dates, outcomes, and collaborators.
- Publication titles, authors, venues, years, DOI values, and URLs.
- People, roles, biographies, profile photographs, and research interests.
- Laboratory history, achievements, contact details, room numbers, and status claims.

Use verified information supplied in project assets or explicitly approved by the user. For missing information:
- Use clearly marked editable placeholders in development data; or
- Hide optional content until verified.

Do not publish placeholder text as if it were factual. Follow `docs/CONTENT_GUIDELINES.md`.

## 5. Engineering Practices

- Follow the existing stack and conventions unless a change is requested.
- Prefer small, focused changes over broad rewrites.
- Use reusable components for repeated UI patterns.
- Keep content data separate from presentation where practical.
- Use semantic HTML and accessible controls.
- Ensure every visible button, link, and interactive object has a meaningful action.
- Avoid unnecessary dependencies and over-engineering.
- Do not add authentication, payments, dashboards, or a CMS unless requested.
- Do not expose secrets, credentials, or private configuration in source control.

## 6. Responsive and Accessible Implementation

- Support desktop, tablet, and mobile layouts.
- Do not simply shrink desktop layouts; adapt their structure.
- Prevent horizontal overflow.
- Provide keyboard access and visible focus states.
- Respect reduced-motion preferences.
- Use descriptive alt text for meaningful images and empty alt text for decorative images.
- Ensure sufficient text contrast.

## 7. Change Workflow

For each task:
1. Restate the intended scope internally and identify affected files.
2. Check existing behavior before changing it.
3. Implement only the requested scope unless a related issue blocks completion.
4. Update relevant documentation when requirements or architecture change.
5. Run available lint, type-check, build, and tests relevant to the change.
6. Report files changed, behavior implemented, checks run, and known limitations.

Do not claim tests passed unless they were actually run.

## 8. Design Fidelity

When a Figma reference or screenshot is supplied:
- Use it as a visual reference, not as permission to invent missing content.
- Match layout, spacing, typography, color, and hierarchy.
- Preserve the current design language across pages.
- If the reference is ambiguous or unavailable, state the assumption rather than inventing a detailed design.

## 9. Documentation Maintenance

- `docs/PRD.md` defines product requirements.
- `docs/DESIGN_SYSTEM.md` defines visual rules.
- `docs/ARCHITECTURE.md` defines implementation structure.
- `docs/SITE_STRUCTURE.md` defines page and navigation structure.
- `docs/CONTENT_GUIDELINES.md` defines factual-content rules.
- `docs/DECISIONS.md` records accepted technical and design decisions.

If implementation conflicts with documentation, do not silently choose one. Identify the conflict and ask for clarification when it affects product behavior or visual direction.
