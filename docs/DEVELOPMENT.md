# Development Guide

## 1. Before Starting

Inspect the repository to identify:
- Framework and framework version.
- Runtime requirements.
- Package manager and lockfile.
- Available scripts.
- Existing routing and styling conventions.
- Existing environment variables.
- Current test and build setup.

Do not assume React, TypeScript, Tailwind, or a specific package manager if the repository has not established them.

## 2. Installation

Use Node.js 24 and npm. Follow the [README](../README.md#getting-started) to install dependencies, run the development site, and review the production export.

## 3. Environment Variables

- Check for `.env.example` or documented environment requirements.
- Never commit real secrets.
- Add new required variables to an example file with safe placeholder values.
- Document why each variable is needed.

## 4. Coding Workflow

1. Read `AGENTS.md` and relevant docs.
2. Inspect the affected implementation.
3. Make a focused change.
4. Keep components and data maintainable.
5. Run the relevant checks.
6. Update docs when requirements or implementation conventions change.

## 5. Code Quality

- Follow existing formatting and lint rules.
- Use clear names.
- Avoid duplicated page-specific styling where shared components are appropriate.
- Prefer typed data where the stack supports it.
- Avoid unnecessary dependencies.
- Keep functions and components focused.

## 6. Styling

- Follow `DESIGN_SYSTEM.md`.
- Reuse design tokens.
- Avoid arbitrary one-off colors and spacing values.
- Ensure responsive behavior.
- Check hover, focus, active, and disabled states.

## 7. Content Updates

Keep research, projects, people, and publication data in a clear, centralized location where practical. Verify all records before they are displayed publicly.

Edit approved copy and directory entries in `src/data/content.ts`. Place approved local assets in `public/` and record provenance in the asset inventory.

## 8. Before Submitting Work

Run the repository's available:
- Lint command.
- Type-check command.
- Unit or integration tests.
- Production build.

Report commands that could not be run and explain why.
