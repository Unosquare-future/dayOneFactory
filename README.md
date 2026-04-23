# DayOne Flow Factory

An editorial React + Vite application for authoring, routing, and measuring
six different onboarding variants against a single style-graph schema,
backed by a 200-SKU limited inventory. Skinned in the **Editorial Blue**
design system.

**Live demo:** [unosquare-future.github.io/dayOneFactory](https://unosquare-future.github.io/dayOneFactory/)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle → dist/ (embeds base: /dayOneFactory/)
npm run preview  # serve the production build locally
```

For a local build that loads at `/` (root path) instead of under
`/dayOneFactory/`:

```bash
VITE_BASE=/ npm run build && npm run preview
```

## Deploy to GitHub Pages

```bash
npm run deploy   # builds into dist/, pushes to gh-pages branch
```

The `gh-pages` branch is what GitHub Pages serves from. The workflow:
1. `predeploy` runs `npm run build && touch dist/.nojekyll`
2. `deploy` pushes `dist/` to the `gh-pages` branch with dotfiles
3. GitHub Pages picks up the push and rebuilds (usually < 30 seconds)

**Before deploying,** make sure your local `.env.local` has the live
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_BUCKET`
— those get embedded into the client bundle at build time so the live
site can fetch images from the bucket.

## Seed real clothing photos

The inventory ships with 200 curated SKUs. By default every item renders
the editorial gradient placeholder — the app is fully functional without
any photos. When you want real Unsplash photos cached in your Supabase
Storage bucket, follow the steps below.

### 1. Credentials

1. Copy the template:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the values — `.env.local` is gitignored.

   | Key | Where to get it | Used by |
   |---|---|---|
   | `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL | client |
   | `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` / `public` key | client |
   | `VITE_SUPABASE_BUCKET` | Bucket name — default `inventory-images` (script creates it if missing) | client & script |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key | **seed script only — never in the client bundle** |
   | `UNSPLASH_ACCESS_KEY` | [unsplash.com/developers](https://unsplash.com/developers) → New Application → `Access Key` | seed script only |

   > **Service-role key is sensitive** — treat it like a password. It stays in
   > `.env.local` on your machine; it never gets imported by the Vite build.

### 2. Run the seeder

```bash
# Default: seed up to 50 items per batch (safe for Unsplash's free
# demo tier of 50 requests/hour). Re-run to continue; it skips
# items already in the manifest.
node scripts/seed-inventory-images.mjs

# Useful flags:
node scripts/seed-inventory-images.mjs --all             # don't stop at 50
node scripts/seed-inventory-images.mjs --limit 20        # custom batch size
node scripts/seed-inventory-images.mjs --category Women  # one segment only
node scripts/seed-inventory-images.mjs --force           # re-seed existing items
```

What it does, per item:
1. Queries Unsplash `/search/photos` with a query built from the item
   name + subcategory + segment (e.g. `cashmere crewneck sweater tops women clothing`).
2. Picks the top portrait-oriented result.
3. Downloads the image.
4. Uploads to your Supabase bucket as `{sku}.jpg`.
5. Writes the public URL + photographer attribution into
   `src/inventory-images.js`.

The script is **resumable** and **rate-limit aware** — it stops gracefully
on HTTP 403 from Unsplash and tells you when to re-run.

### 3. Restart / reload

The manifest file is imported at module load. After a seed run, restart
`npm run dev` (or reload the browser with HMR) and the real photos
replace the gradient placeholders across:
- Inventory grid + item detail modal
- Dashboard inventory KPI
- Outfit Builder canvas + item drawer

Items still missing from the manifest keep the editorial gradient
fallback, so you can partial-seed at any time.

## Design system — Editorial Blue

- **Typography** — Epilogue exclusively (display, headline, body,
  label-bold, eyebrow). Tight letter-spacing on headlines, generous
  line-heights on body copy.
- **Palette** — Primary Teal `#86C8BC` for hero banners, CTAs, and
  active states; Secondary Navy `#001E60` for type on primary and
  headlines on light; Lime `#D2E146` as a sparing pop for badges.
  Neutrals live between `#FFFFFF` and `#F9F9F9`, with outlines
  (`#BFC9C5`) carrying depth.
- **Shape** — 0.25rem soft corners are the default. Hero banners keep
  sharp corners to lean into the magazine aesthetic.
- **Elevation** — flat; tonal layering + hairline 1px outlines. No
  heavy drop shadows. Modals use a hard 2px Navy border plus a subtle
  ambient lift shadow.

## Project structure

```
index.html                  # Vite entry
tailwind.config.js          # Editorial Blue design tokens
.env.example                # env template (safe to commit)
scripts/
  seed-inventory-images.mjs # Unsplash → Supabase image seeder
src/
  main.jsx                  # ReactDOM root
  App.jsx                   # top nav + view switcher
  ui.jsx                    # primitives: Button, Card, Modal, etc.
  state.jsx                 # FactoryProvider: variants, rules, inventory
  data.js                   # fixture data (variants, visitors, rules…)
  inventory.js              # 200 curated SKUs + query builders
  inventory-images.js       # SKU → image URL manifest (seed-script output)
  lib/
    supabase.js             # Supabase client (anon-key, storage reads)
  index.css                 # Tailwind layers + globals + placeholder palettes
  views/
    Dashboard.jsx           # factory overview + KPIs + rules summary
    Inventory.jsx           # catalog browser: Women / Men / Kids
    Variants.jsx            # gallery + six playable flows
    Rules.jsx               # routing rules CRUD
    RouterView.jsx          # reasoning trace + mid-flow adaptation modal
    Simulation.jsx          # dry-run the router against a synthetic cohort
    Results.jsx             # 90-day hero, table, frontier chart
```

## Origin

Scaffolded from an HTML design prototype in `project/`. Fully ported to
a Vite + React application, wrapped in the Editorial Blue design system,
grounded in a real limited inventory, and wired end-to-end (inventory →
variants → rules → router → simulation → results).
