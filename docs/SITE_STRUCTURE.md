# Site Structure and Information Architecture

## 1. Sitemap

```text
/
├── /about
├── /research
├── /projects
├── /people
├── /publications
└── /virtual-lab
```

The Home page is `/`. Route syntax may be adapted to the chosen framework, but page intent must remain consistent.

News & Events is excluded.

## 2. Global Navigation

Standard pages:
- Home
- About
- Research
- Projects
- People
- Publications
- Virtual Lab call to action

Requirements:
- Active route is highlighted.
- All links work.
- Mobile navigation is accessible.
- Navigation is consistent across standard pages.

The Virtual Lab may use a simplified header with the laboratory identity, page title, instruction, and Back to Website link.

## 3. Home Page Sections

1. Hero: institutional label, welcome heading, short introduction, Research and People CTAs, pixel-art workspace visual.
2. Laboratory highlights: only verified facts; avoid invented counters.
3. Research Areas: up to three or another approved number of concise previews when verified records are available.
4. Selected Projects: a small number of previews when verified records are available.
5. About the Laboratory: concise introduction and approved supporting image.
6. Global footer.

Do not add News & Events or a blog feed.

## 4. About Page Sections

1. Page introduction.
2. Who We Are.
3. Laboratory information.
4. Vision & Mission, when approved content exists.
5. Research Philosophy, when approved content exists.
6. Our Environment with supplied photographs.
7. Concise CTA to Research and People.
8. Global footer.

Avoid repeating the same introduction in multiple sections.

## 5. Research Page Sections

1. Page heading and short introduction.
2. Research areas as a vertical editorial list.
3. Each entry: number or small label, title, concise description, optional category tag.
4. Global footer.

## 6. Projects Page Sections

1. Page heading and short introduction.
2. Compact vertical project list.
3. Each project may include title, subtitle, short description, year, category tags, and external links.
4. Global footer.

Do not require project detail pages for the initial release.

## 7. People Page Sections

1. Page heading and short introduction.
2. Member groups based on verified roles.
3. Member profile entries.
4. Optional alumni section only if verified data exists.
5. Global footer.

Do not display empty categories.

## 8. Publications Page Sections

1. Page heading and short introduction.
2. Publication archive.
3. Optional grouping by year.
4. Each record: title, authors, venue, year, and paper link where available.
5. Global footer.

## 9. Virtual Lab

One single-page scene, not separate room routes. Visitors move through connected rooms and can talk to one fictional website guide per room. Each dialogue offers its academic page link. Four direct links below the scene provide the same destinations without requiring movement or JavaScript.

Interactive destinations:
- Research desk or research board → `/research`
- Computer or project display → `/projects`
- Researcher characters or meeting table → `/people`
- Bookshelf or reading area → `/publications`

Provide a clear Back to Website route to Home.

## 10. Footer

Suggested groups:
- Laboratory and institutional identity.
- Academic resource links.
- Verified institutional resources and contact information.
- Copyright and location.

Do not invent official URLs, email addresses, room numbers, or status details.

## Global atmosphere access

All seven pages and 404 expose the same atmosphere switch/picker in their header, outside the mobile navigation disclosure. Virtual Lab keeps Back to Website adjacent. Home artwork and scene movement controls contain no duplicate atmosphere controls.
