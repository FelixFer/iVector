# iVector Lab Website

Official website project for iVector Lab, Department of Computer Science and Information Engineering (CSIE), National Dong Hwa University (NDHU), Hualien, Taiwan.

## Project Purpose

The website introduces the laboratory, communicates its research directions, presents projects and publications, introduces members, and provides an interactive Virtual Lab experience.

The design direction combines minimalist academic presentation with subtle pixel-art elements. See the [PRD](docs/PRD.md#1-product-overview) for the status of the Figma reference.

## Main Pages

1. Home
2. About
3. Research
4. Projects
5. People
6. Publications
7. Virtual Lab

News & Events is not part of the current scope.

## Design Identity

- Typography: Pixelify Sans Bold for page and section titles, Plus Jakarta Sans for reading and navigation
- Main background: Warm Ivory (`#F7F5EF`)
- Primary accent: Powder Blue (`#DCE8F5`)
- Secondary accent: Sage Green (`#DDEBDD`)
- Additional accents: Soft Lavender (`#E9DFF2`) and Peach (`#F5E3D4`)
- Main text: Soft Charcoal (`#343A40`)
- Supporting text: Muted Gray (`#59636D`)

See [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

## Documentation

| Document | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Instructions for AI coding agents |
| [`docs/PRD.md`](docs/PRD.md) | Product requirements and acceptance criteria |
| [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) | Product context and goals |
| [`docs/SITE_STRUCTURE.md`](docs/SITE_STRUCTURE.md) | Sitemap, navigation, and page sections |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Visual identity and UI rules |
| [`docs/MOTION_PLAN.md`](docs/MOTION_PLAN.md) | Audited micro-interactions, animation priorities, and acceptance checks |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Application structure and data flow |
| [`docs/COMPONENTS.md`](docs/COMPONENTS.md) | Reusable component specifications |
| [`docs/CONTENT_GUIDELINES.md`](docs/CONTENT_GUIDELINES.md) | Academic content accuracy rules |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Local setup and development workflow |
| [`docs/TESTING.md`](docs/TESTING.md) | Quality assurance requirements |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Build and deployment guidance |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Accepted design and technical decisions |
| [`docs/ASSETS.md`](docs/ASSETS.md) | Asset inventory and usage rules |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Planned work and future enhancements |
| [`CHANGELOG.md`](CHANGELOG.md) | Significant project changes |

## Getting Started

**Project status: local preview.** The site uses Next.js App Router, TypeScript, Node.js 24, and npm.

```powershell
npm ci
npm run dev
```

Open [the development site](http://localhost:3000). To review the production export:

```powershell
npm run build
npm run preview
```

Open [the static preview](http://127.0.0.1:4173). The portable output is in `out/`.

Run `npm run lint`, `npm run typecheck`, and `npm test` from the project root. The browser tests use the built export and installed Chrome by default. Stop the standalone preview before running the tests so Playwright can start its own.

Start with the [PRD](docs/PRD.md) and [site structure](docs/SITE_STRUCTURE.md). See the [development guide](docs/DEVELOPMENT.md) for contributor practices.

## Content Status

All names, research information, project details, publication records, member profiles, and contact information must be verified against official laboratory sources before publication. Do not treat generated examples or placeholders as factual.

Add approved records to `src/data/content.ts`. Public pages hide missing optional copy and use short directory empty states. Track content gaps and the [next content phase](docs/CONTENT_GUIDELINES.md#12-next-content-phase) in the documentation. The current build asks search engines to skip indexing. See the [release checklist](docs/DEPLOYMENT.md) before publishing.

## Staff editing and private review

The protected `/dashboard/` edits Home/About copy and the four academic directories through Neon. See [CMS handoff](docs/CMS_HANDOFF.md) for account activation, publishing, private review builds, and recovery. Normal builds and public GitHub checks use approved local records; CMS-backed exports are built privately. Public deployment remains separate.

