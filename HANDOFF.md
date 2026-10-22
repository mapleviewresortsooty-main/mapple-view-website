# Handoff Notes — Mapple View Resort

Read this first in any new session working on this project.

## What this project is

A resort website with an integrated booking system and a separate admin
panel, for "Mapple View Resort". Full build complete, including the
Cloudflare/Neon migration described below.

- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4,
  deployed to **Cloudflare Workers** (via `@opennextjs/cloudflare`),
  backed by **Neon serverless Postgres** (`@neondatabase/serverless`) and
  **Cloudflare R2** for room images. (Originally built on local SQLite —
  fully migrated away from that; see "Cloudflare + Neon migration" below.)
- **Design**: kept as originally built — forest green / gold / cream
  palette, Playfair Display + Inter fonts (`src/app/globals.css`,
  `src/app/layout.tsx`). A redesign was explored (two alternate visual
  directions were drafted and published as a comparison artifact:
  https://claude.ai/artifact/4qYti8EhEToaJHboEMUgkf) but **the user
  decided to drop that and keep the original design** — do not revisit
  this without the user raising it again.
- **Public site** (`src/app/(site)/…`): home, rooms & suites listing +
  detail w/ booking form, about, contact, and the booking/payment flow at
  `/booking/[id]`. The whole `(site)` layout is `force-dynamic` since its
  data comes from a live Postgres connection now, not something safe to
  prerender at build time.
- **Booking flow**: guest picks room + dates → enters name/phone/email →
  sees a UPI QR code (generated server-side from the admin-configured UPI
  ID via `src/lib/upi.ts`) → clicks "I've Paid — Confirm Booking" → the
  owner is notified on WhatsApp (`src/lib/whatsapp.ts`): automatically via
  WhatsApp Cloud API if the admin configured a token + phone number ID,
  otherwise a pre-filled `wa.me` link opens on the guest's device as a
  fallback.
- **Admin panel** (`src/app/admin/…`, protected by `src/proxy.ts` — Next 16
  renamed `middleware.ts` to `proxy.ts`): login, dashboard, rooms CRUD with
  image upload (now to R2, see below), bookings list/detail with status
  updates, and settings for resort info / UPI / WhatsApp config. Default
  login is `admin` / `changeme123` (seeded on first run if
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` aren't set) — **must be changed**
  after first real deploy.
- Publicly-facing flows were fully tested end-to-end in a real browser
  *before* the Cloudflare/Neon migration (against the old SQLite backend):
  booking flow, QR generation, WhatsApp fallback link, admin
  login/dashboard/rooms/bookings/settings all confirmed working then.
  **Not yet re-tested against real Neon/Cloudflare** — see next section.

## Cloudflare + Neon migration: code done, deploy not done

All application code has been migrated and is committed
(`git log` — look for "Migrate to Cloudflare Workers + Neon Postgres +
R2"). What's actually been verified vs. not:

**Verified** (in this sandbox, no real Cloudflare/Neon account access):
- `next build` succeeds with a placeholder `DATABASE_URL`.
- The real adapter build (`npx opennextjs-cloudflare build`) succeeds end
  to end, producing `.open-next/worker.js`.
- Lint is clean.
- TypeScript compiles clean (had to fix ~13 call sites where
  `@cloudflare/workers-types` correctly types `Response.json()` as
  `unknown` instead of DOM lib's looser `any` — now explicitly typed).

**NOT verified** (needs real credentials, which this sandbox never had —
Cloudflare's and Neon's own doc domains are also egress-blocked here):
- Nothing has actually run against a real Neon database — the schema
  migration/seed logic in `src/lib/db.ts` (`runMigration()`, called
  lazily via `ensureMigrated()` on first query per Worker isolate) has
  never executed for real.
- Nothing has been deployed to Cloudflare. No `wrangler login`,
  `wrangler secret put`, `wrangler r2 bucket create`, or `wrangler deploy`
  has been run — a `migrate` scaffolding command *did* briefly auto-invoke
  `wrangler login` unprompted (opened an OAuth URL), but it timed out
  with no browser available and no login actually completed. Verify this
  wasn't followed up on outside this session before assuming zero
  Cloudflare account changes.
- R2 image upload/serving (`src/app/api/admin/upload/route.ts`,
  `src/app/uploads/[key]/route.ts`, using `getCloudflareContext()`) is
  written against the documented API but never exercised against a real
  bucket.

**Do the first real deploy carefully, with the user present**, and treat
it as the actual first test of this migration. `README.md` has the full
step-by-step (bucket creation, secrets, build/deploy commands). Order
matters: R2 bucket must exist and secrets must be set before the first
`npm run deploy`, or the Worker will error at runtime on first request.

**Do not run any `wrangler login`, `wrangler secret put`, resource
creation, or `wrangler deploy` command without the user present and
explicitly confirming** — these touch real, billing-adjacent cloud
accounts.

### Schema note
Postgres schema mirrors the old SQLite one closely (see `src/lib/db.ts`):
`is_active` and `whatsapp_sent` are still plain `INTEGER` (0/1), not
native `boolean`, to minimize churn in code that treats them as
truthy/falsy numbers. `images`/`amenities` are still `TEXT` holding
JSON, parsed in `src/lib/models.ts`, not native `jsonb`. These are
deliberate minimal-diff choices, not oversights — fine to leave as is.

## ⚠️ Still unresolved: GitHub push access

Nothing has reached GitHub — this has been true since the very first
commit on this branch and remains true. Both `git push` and the GitHub
API (`push_files`) return the same 403:

> Claude doesn't have GitHub access to
> `amtechnexusofficial/Mapple-View-resort` for your organization
> (`Resource not accessible by integration`)

`get_me` / `list_branches` via the GitHub MCP tools work fine (read access
exists), confirming this is specifically a missing **write** grant. Fix
needed before anything can reach GitHub:

- Org admin installs/grants the Claude GitHub App:
  https://github.com/apps/claude/installations/select_target
- Or reconnect GitHub from claude.ai settings:
  https://claude.ai/customize/connectors?auth_start=github&auth_start_force=1

**If a new session starts from a fresh clone of the (still-empty) GitHub
repo, none of the work described in this file will be present on disk** —
it only exists in whichever session's container did the work, unless it
was pushed. Check `git log` first (there should be multiple commits,
most recently "Migrate to Cloudflare Workers + Neon Postgres + R2"); if
the repo looks empty or stops earlier than that, the missing work needs
recovering from an earlier session before continuing.

## MCP servers

- `inspo` — registered `--scope user`, but **the user does not want it
  used** (explicitly declined). Ignore even if connected.
- `playwright` — registered at **project scope**
  (`claude mcp add playwright npx @playwright/mcp@latest`). Intended for
  browser-driving/visual QA of the site. This environment has Chromium
  pre-installed system-wide, so it should connect without a separate
  browser install step.

Both were registered by running `claude mcp add …` inside a running
session, which writes to that session's container's `/root/.claude.json`
— whether a new session's container has this depends on factors this
file can't predict. **Check whether the tools actually show up** before
assuming either is connected; if not, re-run the commands above (takes
seconds), then that new registration still needs one more session
restart to actually load.

## Suggested next steps

1. Confirm the repo state matches this file's description (`git log`,
   `git status`) — if it looks empty or behind, the work needs recovering
   before continuing (see GitHub section above).
2. If not already done: with the user present, get real Neon +
   Cloudflare credentials, create the R2 bucket, set the Worker secrets,
   and run the first real `npm run deploy`. Treat this as the first real
   test of the whole migration — watch for errors on the very first
   request (schema migration running for real, R2 upload/serve working).
3. Once deployed and confirmed working, re-run the same end-to-end manual
   test pass described under "Public site" above (booking flow → UPI QR →
   confirm → WhatsApp notify; admin login → rooms CRUD w/ real image
   upload → bookings → settings) against the real deployment.
4. Once GitHub write access is restored (see above), push
   `claude/clever-dijkstra-egffzv`.
5. Set up GitHub → Cloudflare continuous deployment (README has both
   options) once the manual deploy is confirmed working.
