# Content Guidelines and Data Integrity

## 1. Core Rule

The website represents an academic research laboratory. Factual accuracy is mandatory. Do not invent information to make a page appear complete.

## 2. Approved Sources

Use information from:
- Official laboratory materials supplied by the user.
- Approved content in the Figma design, after verification.
- Official NDHU or CSIE pages.
- Publication publisher pages, DOI records, or author-approved sources.
- Information explicitly confirmed by the laboratory.

If sources disagree, flag the discrepancy instead of choosing arbitrarily.

## 3. Research Areas

Do not invent research directions, claims, or capabilities. Preserve official names and descriptions. Ask for approval when wording materially changes the meaning.

## 4. Projects

Verify:
- Project name.
- Project description.
- Year or period.
- Contributors, if displayed.
- Categories.
- GitHub, paper, demo, or project URLs.

Do not imply that a paper or repository belongs to a project unless verified.

## 5. People

Verify:
- Full name and preferred public form.
- Academic role.
- Membership status.
- Profile image permission and provenance.
- Research interests.
- Public email and website links.

Do not generate fictional members, biographies, or photographs.

## 6. Publications

Verify:
- Exact title.
- Complete author list and order.
- Venue or journal.
- Publication year.
- DOI or publisher URL.
- Publication status, if described as accepted, published, or forthcoming.

Never fabricate a citation, DOI, conference, journal, or author.

## 7. Institutional Information

Verify all:
- Institution and department names.
- Address and room number.
- Contact email and telephone.
- Official website URLs.
- Laboratory status and operational claims.
- Awards, grants, and affiliations.

## 8. Placeholder Policy

Placeholders may be used during development, but must be visibly marked in data or code, for example:

```ts
// TODO(content): Replace with approved laboratory introduction.
```

Do not display placeholder labels or sample records as if they were facts. Hide incomplete optional sections in production.

Do not render development-status messages such as Preview, pending approval, or TODO on visitor-facing pages. Keep missing-content notes in this document or data comments. Home and About retain verified identity without substituting generated introduction text.

When a directory has no entries, use plain text without a badge or notice container:

| Directory | Empty state |
|---|---|
| Research | No research areas listed. |
| Projects | No projects listed. |
| People | No member profiles listed. |
| Publications | No publications listed. |

These messages describe the site's listed records, not whether the laboratory has research, projects, members, or publications. Adding verified records automatically replaces the empty state.

## 9. Launch Content and Sign-off

The project owner names a lab content approver before launch. The approver confirms the verified source for published content and records any directory empty-state exceptions.

| Pages | Minimum content for launch |
|---|---|
| Home and About | Approved lab identity, institutional affiliation, and introductory copy appropriate to each page. |
| Research, Projects, People, and Publications | At least one verified entry per directory, or a page-specific empty-state message approved by the lab content approver. Keep the route reachable in either case. |
| Virtual Lab | Approved scene artwork and accurate labels for the four destinations and the Home return link. |

Missing minimum content blocks launch unless a directory has an approved empty state. Omit optional material such as unverified previews, images, and contact details until it can be verified.

## 10. Writing Style

- Clear, concise, and professional.
- Prefer plain language.
- Avoid exaggerated promotional claims.
- Keep research summaries understandable to academic visitors outside the immediate specialty.
- Avoid repeating the same paragraph across multiple pages.

## 11. Images and Rights

- Use approved photographs and assets.
- Record source and license where known.
- Do not portray generated images as real people or actual laboratory facilities.
- Provide useful alt text for meaningful images.

## 12. Next Content Phase

Populate content in the existing typed modules. Do not add filler sections to compensate for missing records. Use concise paragraphs, descriptive headings, and editorial lists with the approved typography and artwork.

| Page | Content purpose and source material needed |
|---|---|
| Home | One approved sentence explaining the lab's focus, followed by selected verified research and projects. Obtain the focus statement from the lab; reuse directory records for the selections. |
| About | A short approved introduction and approach to research, plus an environment image with permission. Add further sections only when their content serves a distinct purpose. |
| Research | Verified directions explaining each problem and the lab's approach. Use lab-approved titles and descriptions. |
| Projects | Compact records describing the problem, work produced, and available paper, code, or demo links. Verify all relationships and URLs. |
| People | Verified members grouped by role, concise profiles, and supplied photographs. Confirm names, roles, permissions, and public links. |
| Publications | Chronological citations with verified author order, venue, year, and paper links. |
| Virtual Lab | Brief navigation guidance and fictional website guides that point to the academic pages. |

Current content gaps: Home introduction and About copy are empty; Research, Projects, People, and Publications contain no records. Verified lab identity is available, and Virtual Lab artwork is approved. Keep this status internal.

First collect the Home focus sentence, research directions, and member identity. Then add project and publication records and expand About from approved material. Review Home selections after the directories are populated. Lab content sign-off and deployment remain separate from the copy cleanup.

## P0 member update

Identity-based Home/About copy and the official Yu-Chieh Ho faculty entry are seeded locally. Four master’s students were supplied by the project owner on 2026-11-15: Felix Ferdinand, 李彥龍, 邱柏誠, Vo Cong Vinh. IDs, nationalities and derived institutional emails are owner-provided. Photos are optional with initials fallbacks. Research, Projects and Publications still have no records. Earlier empty-directory inventory describes the pre-P0 state.


## P2 academic relationships

Optional relatedIds lists refer to stable IDs from Research, Projects, People, or Publications. Supply a relationship only with approved source material; linking a member does not replace or change the publication author list. One explicit edge produces links in both directions; no transitive or name-based connections. Unknown/self targets fail validation, and repeated references are deduplicated. Remove inbound references before deleting/unpublishing a linked record. IDs are durable because bookmarks depend on them. No relationships have been invented for current seed members.
