# Light the Lab

Light the Lab opens in a native modal through the titled book beside the Projects desk. Walk within 12 scene units with clear line of sight, then press E or activate the book button. Closing clears movement and returns focus to the book or scene. The current round remains available during the mounted page visit.

The game uses a versioned seven-board daily bank selected by Taipei date. Each tile rotates clockwise. Power follows reciprocal connectors from the battery contact to the lamp contact. Their sides follow the board’s weekly orientation. Fewest rotations wins, then elapsed whole seconds, then finish order. The server verifies the entire move history and records time before nickname submission. Ranked rounds remain attached to their starting date. Closing continues timing. Reloading starts a new attempt.

Browser identifiers are random and stored locally. They support one personal best per browser/day, not proof of identity. Clearing storage, automated solvers, and different devices can affect casual rankings. Nicknames are public display labels. Staff can hide a result through Game scores; this excludes all that player's scores for that day.

## Backend

A separate Neon Function (`ivectorgame`) uses GAME_DATABASE_URL, restricted to lab_game tables. It reuses the existing owner JWT verification for /admin. Academic runtime grants remain separate. Public operations are GET /today, POST /start, POST /finish, POST /submit. The server issues random run IDs and validates player IDs, histories, and names. Starts are limited to 30 per player/hour. CORS uses explicitly configured local/site origins. Browser identifiers can be replaced, so this limit provides modest abuse resistance only.

Set CMS_SETUP_DATABASE_URL privately to an owner connection before running `node --env-file=.env.local scripts/game-setup.mjs`. This initializes game/migration.sql and creates a restricted login, appending its generated credential only to ignored .env.local. Existing logins are preserved. Set GAME_DATABASE_URL for the Function and NEXT_PUBLIC_GAME_API_URL for the build. Bundle using scripts/cms-bundle.mjs and deploy through neon.ts. Publishing the public website remains separate.

No game credentials or live scores are included in the static export. Missing connectivity/storage enables clearly labeled unranked practice. Failed finished submissions preserve the input for retry. The game records are independent of CMS backups. Include lab_game in private database recovery procedures before relying on leaderboard history.

## Review

Use Caveman for concise updates, Ponytail for existing patterns/platform APIs, and Anti-Slop for purpose, mobile layout, contrast and rendered review. Energy 1, rhythm 1, motion 1. Lamp emphasis conveys a usable desk object. No continuous pulse is needed. Existing themes and typography carry the modal. Focus outlines and pressed states are immediate. Reduced motion shows final states instantly.

Live activation completed in the existing project. Verified server finish/submission/retry and denied game-role access to CMS drafts. Deployment policy preserved an older origin value during repeated full deploys; targeted `neon functions deploy ivectorgame --src .cms/game-function --no-bundle --env GAME_ALLOWED_ORIGINS=...` applied the intended local allowlist. A subsequent HTTP check returned 200 with the exact 4174 origin. Keep deployment configuration and the actual allowed origins aligned when selecting a public domain.

The first release uses seven daily boards with whole-board quarter-turn variants across weeks. Independent game backup/restore rehearsal remains follow-up work. Live signed-in moderation and the mobile software keyboard have not been independently exercised.


Book access refinement replaces the scene lamp and separate launcher with one titled, glowing pixel book. Its button remains keyboard-focusable while out of reach and uses aria-disabled. The character must be within 12 units with line of sight before click, tap, Enter/Space or scene-focused E opens the modal. A two-cycle, 4-second, 2px float runs on first Projects entry, with static reduced-motion rendering. The permanent Light the Lab plate uses Pixelify Sans at 12px. Room effects use distinct role/room keys to avoid sibling identity collisions. Narrow screens shift the Projects sign slightly left to keep the book title clear.


## Workbench results refinement

The panel uses a sage instrument case with inset cable sockets. A continuous cable and an amber stripe distinguish powered connections. Both themes use the same contact geometry. At 768 px and wider, the standings and round controls share the column beside the board. After a win, the controls become a result with rotations, time and the qualifying nickname form. On phones, Game shows the result above the finished board so posting and replay are within reach. Posting selects Top 5, moves keyboard focus there and highlights the submitted run by ID.

Board terminals show fixed START battery and END lamp contacts, placed using the source/sink connector bits through weekly rotations. A framed desktop workbench puts the public Top 5 on the right. Phones use Game and Top 5 tabs that preserve the round. The winning move locks input immediately and focuses the result. The finish service projects the verified run into the daily personal-best ranking before offering a nickname. Submission rechecks qualification under a daily transaction lock; displaced candidates keep their result and receive refreshed standings. Failed verification preserves the solution and offers Retry verification. Existing records need no migration.
