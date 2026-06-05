# Christmas24 — Project Context

A headless Christmas retail storefront built with Next.js 15 and the Shopify Storefront API.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | SCSS Modules (no Tailwind) |
| Data | Shopify Storefront API (GraphQL, v2024-10) |
| Rendering | SSG + ISR (`revalidate: 60`) |
| Cart | Client-side via React Context, persisted in `localStorage` |
| Checkout | Redirect to Shopify-hosted checkout |
| Fonts | Playfair Display (serif headings) + Lato (sans body) via Google Fonts |

---

## Repository structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout — wraps everything in CartProvider
│   ├── page.tsx                          # Homepage: hero + featured collections
│   ├── not-found.tsx                     # 404 page
│   ├── collections/[handle]/
│   │   ├── page.tsx                      # Server component — fetches collection + products
│   │   └── CollectionPageClient.tsx      # Client component — filters, sort, grid
│   ├── products/[handle]/
│   │   ├── page.tsx                      # Server component — fetches single product
│   │   └── ProductPageClient.tsx         # Client component — gallery, variants, add to cart
│   └── search/
│       └── page.tsx                      # Server component — search results
├── components/
│   ├── Navbar/
│   │   ├── Navbar.tsx                    # Async server component — fetches nav collections
│   │   └── NavClient.tsx                 # Client component — scroll effect, active links
│   ├── MobileMenu/                       # Slide-in drawer (left), shown below lg breakpoint
│   ├── SearchBar/                        # Modal overlay search, routes to /search?q=
│   ├── CartDrawer/                       # Slide-in drawer (right), quantity controls
│   ├── ProductCard/                      # Card used in grids — image, price, sale badge
│   ├── HeroBanner/                       # Full-viewport hero on homepage
│   ├── FeaturedCollection/               # Async server component — 4 best-selling products
│   └── Footer/
├── context/
│   └── CartContext.tsx                   # Cart state — add/update/remove, open/close drawer
├── lib/
│   └── shopify.ts                        # All Shopify GraphQL queries + TypeScript types
└── styles/
    ├── _variables.scss                   # Colours, spacing, typography, shadows, z-index
    ├── _mixins.scss                      # Breakpoints, layout, button, card, focus mixins
    └── globals.scss                      # Reset, body, scrollbar, Google Fonts import
```

---

## Design system

### Christmas colour palette

| Variable | Hex | Usage |
|---|---|---|
| `$red` | `#C41E3A` | Primary CTA buttons, sale badges, accents |
| `$red-dark` | `#9B1530` | Hover state for red buttons |
| `$green` | `#165B33` | Navbar background, headings, borders |
| `$green-mid` | `#1E7A45` | Hover states, scrollbar |
| `$gold` | `#D4AF37` | Logo accent, dividers, hero CTA |
| `$gold-light` | `#F0D060` | Hover gold, snowflake tints |
| `$cream` | `#FAFAF0` | Page background |
| `$charcoal` | `#1A1A1A` | Body text |

### Breakpoints (defined in `_mixins.scss`)

| Mixin | Range |
|---|---|
| `@include xs` | < 480px |
| `@include sm` | 480–767px |
| `@include sm-down` | < 768px |
| `@include md` | 768–1023px |
| `@include md-down` | < 1024px |
| `@include md-up` | ≥ 768px |
| `@include lg` | 1024–1279px |
| `@include lg-up` | ≥ 1024px |
| `@include xl` | ≥ 1280px |

### Key mixins

- `@include container` — max-width 1280px, centred, with responsive padding
- `@include btn-primary` — red filled button
- `@include btn-secondary` — green outlined button
- `@include btn-gold` — gold filled button
- `@include card` — white card with hover lift shadow
- `@include heading-xl/lg/md` — Playfair Display responsive headings

---

## Environment variables

All three must be in `.env.local` (never committed):

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=christmas-shop-24-2.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-public-token-here
NEXT_PUBLIC_NAV_COLLECTIONS=tree-decorations,gifts,stocking-fillers
```

- `NEXT_PUBLIC_` prefix is required on all three — cart mutations run client-side so the vars must be browser-accessible.
- The Storefront token comes from **Shopify Admin → Sales channels → Headless → Storefront API → Public access token**.
- Collection values are URL handles (e.g. `tree-decorations`), not titles. Find them under **Search engine listing** on each collection page in Shopify Admin.

---

## Shopify integration

- **API version:** `2024-10`
- **Endpoint:** `https://${domain}/api/2024-10/graphql.json`
- **Auth header:** `X-Shopify-Storefront-Access-Token`
- All queries and mutations live in `src/lib/shopify.ts`
- Cart ID is stored in `localStorage` under the key `shopify_cart_id`
- Collections are auto-populated in the navbar by reading `NEXT_PUBLIC_NAV_COLLECTIONS` — add a handle to that env var and it appears in the nav automatically, no code changes needed

### Storefront API scopes required

- `unauthenticated_read_product_listings` (covers products and collections)
- `unauthenticated_read_product_inventory`
- `unauthenticated_read_product_tags`
- `unauthenticated_write_checkouts`
- `unauthenticated_read_checkouts`

---

## Key patterns & conventions

- **Server vs client split:** data fetching always happens in server components (`page.tsx`, `Navbar.tsx`, `FeaturedCollection.tsx`). Interactive UI is split into a paired `*Client.tsx` file.
- **SCSS modules:** every component has a colocated `.module.scss` file. Global styles and the design system only live in `src/styles/`.
- **ISR revalidation:** all server pages use `export const revalidate = 60` (1 minute).
- **Images:** all product images come from `cdn.shopify.com`, whitelisted in `next.config.ts`.
- **`@/` path alias** maps to `src/` — use it everywhere instead of relative imports.

---

## Running locally

```bash
cp .env.local.example .env.local   # fill in your Shopify credentials
npm install
npm run dev                         # http://localhost:3000
```
