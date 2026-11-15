# Deployment Guide

## 1. Purpose

The current milestone delivers a local static preview. Select and confirm the production host and domain after the lab signs off.

## 2. Pre-Deployment Checklist

- [ ] Production build completes successfully.
- [ ] Lint and type checks pass.
- [ ] Relevant tests pass.
- [ ] All seven routes work.
- [ ] No News & Events content is present.
- [ ] The lab content approver has signed off on the [launch content minimum and any directory empty states](CONTENT_GUIDELINES.md#9-launch-content-and-sign-off).
- [ ] No placeholder or fabricated academic content is public.
- [ ] All external links are verified.
- [ ] Responsive layouts are checked.
- [ ] Visual QA is complete against the [approved Figma reference](PRD.md#1-product-overview).
- [ ] Images are optimized.
- [ ] Page titles and metadata are set.
- [ ] No secrets are committed.
- [ ] Error and not-found behavior is checked.

## 3. Environment Configuration

- Document required environment variables.
- Configure production values in the hosting provider's secure settings.
- Never store secrets in public source files.
- Keep `.env` files containing secrets out of version control.

## 4. Build and Hosting

Run `npm ci` and `npm run build`. Serve `out/` with directory indexes and use `404.html` for unknown paths. Run `npm run preview` to check that configuration locally.

Before public release, configure the canonical origin and page URLs, then remove the preview-only robots restriction in the root layout. Rebuild and verify the production metadata.

## 5. Domain and HTTPS

When a domain is configured:
- Confirm domain ownership.
- Enable HTTPS.
- Verify canonical URLs.
- Check redirects and trailing-slash behavior.

## 6. Post-Deployment Verification

- Open every page directly.
- Test navigation and external links.
- Test the Virtual Lab on desktop and mobile.
- Check images and fonts.
- Check browser console and network errors.
- Verify page metadata and social previews.

## 7. Rollback

Keep a known-good deployment or revision available. If a release breaks core navigation or content, restore the last known-good version and investigate before redeploying.
