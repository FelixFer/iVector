# Testing and Quality Assurance

## 1. Purpose

Verify that the website works correctly, follows the design system, remains responsive, and does not publish fabricated information.

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
