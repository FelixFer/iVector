# Asset Inventory and Guidelines

## 1. Purpose

Track visual assets used by the iVector Lab website, including photographs, illustrations, logos, icons, and fonts.

## 2. Asset Categories

Suggested organization:

```text
public/
├── images/
│   ├── laboratory/
│   ├── campus/
│   ├── people/
│   ├── projects/
│   └── illustrations/
├── icons/
└── fonts/
```

Adapt this to the framework's asset conventions.

## 3. Asset Inventory

Maintain an inventory with:
- Filename.
- Purpose.
- Source or creator.
- License or permission status.
- Alt text or accessibility notes.
- Pages where it is used.

| Asset | Source and status | Usage and accessibility |
|---|---|---|
| `public/art/workspace.svg` | Original pixel-art workspace illustration created for the preview. Approval pending. | Decorative Home hero art with empty alt text. |
| `public/art/lab-map.svg` | Original schematic pixel-art scene; project owner approved artwork on 2026-11-13. Doorways aligned with collision geometry. | Decorative Virtual Lab map with empty alt text. Semantic controls and direct links supply names. |
| `src/app/virtual-lab/playable.tsx` Sprite SVG | Original local pixel-character drawing created for the approved playable-scene plan, 2026-11-13. | Four-facing visitor and four differently colored fictional guides. Decorative SVG inside named controls, not portraits of real members. |

Add approved photos and final artwork to this inventory as the lab supplies them.

## 4. Logo

Use the approved iVector Lab logo or wordmark if supplied. Do not redraw or invent an official logo without approval.

## 5. Photography

- Use approved laboratory, campus, and member photographs.
- Confirm permission to publish identifiable people.
- Do not use generated images as if they were real laboratory photographs.
- Optimize file size and dimensions.

## 6. Pixel-Art Illustrations

Generic pixel-art illustrations may be used for:
- Research workspace.
- Computer and monitor.
- Bookshelf and reading area.
- Technical diagrams.
- Generic furniture and decorative objects.

Keep scale and style consistent. Do not imply that a generic illustration is a photograph of a real lab room.

## 7. Fonts

- Pixelify Sans Bold for display and Plus Jakarta Sans for reading, both self-hosted through Fontsource.

Prefer reliable font loading and provide sensible fallback fonts. Confirm licensing and source when self-hosting.

## 8. Image Optimization

- Use appropriate modern formats when supported.
- Provide responsive dimensions where practical.
- Avoid unnecessarily large assets.
- Set width and height or aspect ratio to reduce layout shifts.

P1 adds an original decorative cloud SVG in src/components/motion.tsx and decorative monitor overlays in the Virtual Lab controller. They use the existing artwork coordinate systems, have no accessible control role, and do not change collision geometry.


## P1 extension artwork

Original inline SVG illustrations in src/components/page-accent.tsx were authored for this project: lamp/notebook, sketchbook, monitor, meeting table/chairs, and books/bookmark. Generic decorative objects, no depiction of actual facilities or people; hidden from assistive technology. No external source or license required.

## P2 atmosphere artwork

Home and Virtual Lab now render native SVG components derived from the existing original workspace.svg and lab-map.svg artwork. Day retains the original composition; Night uses scoped palette changes, a decorative moon/stars and warm lamp/monitor accents. Original viewBoxes (120 × 90 and 240 × 140), furniture and doorways are preserved. All artwork remains decorative and pointer-transparent; no imagery depicts actual members or facilities. Existing SVG files remain the source/provenance reference.

The atmosphere picker now uses an original inline 20 × 20 pixel palette SVG with three muted swatches and a small Automatic clock indicator. It replaces Unicode glyph icons and remains decorative within the labeled button.

### Light the Lab

The Projects desk lamp is original inline SVG created for this feature, with a two-tone pixel halo. Cable tiles are native SVG line segments generated from the game board. Both use existing type, surface and focus tokens. No third-party artwork or member identity is used.
