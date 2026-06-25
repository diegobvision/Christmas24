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
│   ├── blog/
│   │   ├── page.tsx                      # Server component — 20 latest articles, header + intro
│   │   ├── BlogClient.tsx                # Client component — tag filter, article grid
│   │   └── [handle]/
│   │       └── page.tsx                  # Server component — single article, SSG + generateMetadata
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
│   ├── BlogCard/                         # Article card (16/9 image, author, date, excerpt) + TagPill
│   ├── HeroBanner/                       # Full-viewport hero on homepage
│   ├── FeaturedCollection/               # Async server component — 4 best-selling products
│   ├── ShareButtons/                     # Client component — social share + copy link (product & article pages)
│   ├── BlogRecommendations/              # Async server component — tag-matched products at end of article
│   │   └── RecommendationsTracker.tsx    # Client — fires view_item_list when recs render
│   └── Footer/
├── context/
│   └── CartContext.tsx                   # Cart state — add/update/remove, open/close drawer
├── lib/
│   ├── shopify.ts                        # All Shopify GraphQL queries + TypeScript types
│   └── gtm.ts                            # GA4 / GTM dataLayer helpers (typed event pushers)
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
- `unauthenticated_read_content` (blogs and articles)

### Blog (Shopify Blogs & Articles)

- Powered by Shopify's native blog — articles are written in **Shopify Admin → Online Store → Blog posts** and appear on the site within a minute (ISR).
- Queries in `src/lib/shopify.ts`: `getArticles(first)` (latest N from the first blog), `getArticleByHandle(blogHandle, articleHandle)`, `getBlogHandles()`. The `Article.author` field is queried via `authorV2` (the non-deprecated field), aliased to `author`.
- `getArticles` reads from the **first blog only** (`blogs(first: 1)`) — the store currently has a single blog (`news`).
- Article URLs are `/blog/<article-handle>` — the blog handle is not in the URL. The article page resolves the owning blog internally by looping over `getBlogHandles()`, since article handles are unique within a blog.
- All articles are pre-rendered at build time via `generateStaticParams`; new articles published after a deploy are still served on demand thanks to ISR.
- The listing page's tag filter is purely client-side (in `BlogClient.tsx`) and only renders if articles have tags.

---

## Conversion & engagement features

### Social sharing (`ShareButtons`)

- Client component rendered on **product pages** (inside `ProductPageClient`, below add-to-cart) and **blog articles** (below the article body).
- Buttons: Facebook, X, Pinterest, WhatsApp, Email, and a **Copy link** button (uses the Clipboard API, shows a "Link copied!" confirmation).
- Props: `url` (absolute, passed from the server component using `NEXT_PUBLIC_SITE_URL`), `title`, `contentType` (`"product" | "article"`), `id` (handle), optional `image` (used as the Pinterest media).
- On every interaction it pushes a GA4 `share` event via `shareContent()` in `lib/gtm.ts` **and** exposes stable `data-gtm` attributes for GTM CSS-selector triggers (see below).

### Blog product recommendations (`BlogRecommendations`)

- Async server component rendered at the **end of every blog article**, passed `article.tags`.
- Logic: `getProductsByTags(tags)` finds products sharing **any** of the article's tags (Shopify `query: tag:"x" OR tag:"y"`, sorted `BEST_SELLING`). If **no products match**, it falls back to the **first handle in `NEXT_PUBLIC_NAV_COLLECTIONS`** (`getNavCollectionHandles()[0]`) via `getFeaturedCollectionProducts`.
- Renders `ProductCard`s with `listId="blog-recommendations"`, so card clicks fire the existing `select_item` event. `RecommendationsTracker` (client) fires one `view_item_list` event on mount.
- Returns `null` if neither tags nor the fallback collection yield products.

### GTM tracking hooks

All hooks are **stable `data-gtm` attributes** (SCSS-module class names are hashed and cannot be targeted in GTM — use these instead). Two complementary mechanisms, both already wired:

**1. dataLayer events** (preferred — typed pushers in `lib/gtm.ts`):

| Event | Fires when | Key params |
|---|---|---|
| `share` | A share/copy button is clicked | `method` (facebook/x/pinterest/whatsapp/email/copy_link), `content_type`, `item_id` |
| `view_item_list` | Recommendation block renders | `ecommerce.item_list_id = "blog-recommendations"`, `items` |
| `select_item` | A recommended product card is clicked | `ecommerce.item_list_id = "blog-recommendations"`, `items` |

**2. CSS-selector hooks** (for click triggers without code):

| Selector | Element |
|---|---|
| `[data-gtm="share"]` | Any individual share/copy button (also has `data-gtm-share-method`, `data-gtm-share-content-type`, `data-gtm-share-id`) |
| `[data-gtm="share-bar"]` | The share bar wrapper |
| `[data-gtm="blog-recommendations"]` | The recommendations section (also has `data-gtm-rec-source` = `tag-match` or `collection-fallback`) |
| `[data-gtm="blog-recommendations"] [data-gtm="product-card"]` | A clicked recommended product |

**GTM container setup (one-time):**
1. **Variables** — create Data Layer Variables: `dlv - method`, `dlv - content_type`, `dlv - item_id`, `dlv - ecommerce.item_list_id`.
2. **Share trigger** — Custom Event trigger on event name `share` → GA4 Event tag `share` mapping `method` / `content_type` / `item_id`. (Or a Click trigger on CSS selector `[data-gtm="share"]` reading the `data-gtm-share-*` attributes via Auto-Event / DOM-element variables.)
3. **Recommendation view trigger** — Custom Event trigger on `view_item_list`, filtered where `dlv - ecommerce.item_list_id` equals `blog-recommendations` → GA4 `view_item_list` tag.
4. **Recommendation click trigger** — reuse the existing `select_item` GA4 tag; segment in GA4 on `item_list_id = blog-recommendations`. (Or a Click trigger on `[data-gtm="blog-recommendations"] [data-gtm="product-card"]`.)
5. Requires `NEXT_PUBLIC_GTM_ID` set; the GA4 Configuration tag already fires on All Pages.

### Live GTM container structure

- **Container:** `GTM-5NG9RV9K` — **GA4 Measurement ID:** `G-XY6QN8BNWJ`.
- **One GA4 Configuration tag** (Google Tag `G-XY6QN8BNWJ`) fires on initialization (`gtm.init`) / All Pages and sets the default Measurement ID for the page. The GA4 Event tags below carry **no explicit Measurement ID** — they inherit it from this Google Tag.
- **Nine GA4 Event tags**, each fired by its **own Custom Event trigger** matching the event name exactly (`{{Event}} equals <name>`, no regex). This is a strict 1:1 mapping:

| Custom Event trigger (`Event ==`) | GA4 Event tag | dataLayer pusher in `lib/gtm.ts` |
|---|---|---|
| `add_to_cart` | `add_to_cart` | `addToCart()` |
| `begin_checkout` | `begin_checkout` | `beginCheckout()` |
| `view_item` | `view_item` | `viewItem()` |
| `view_item_list` | `view_item_list` | `viewItemList()` / `viewRecommendations()` |
| `select_item` | `select_item` | `selectItem()` |
| `search` | `search` | `trackSearch()` |
| `filter_used` | `filter_used` | `filterUsed()` |
| `hero_cta_click` | `hero_cta_click` | `heroCTAClick()` |
| `share` | `share` | `shareContent()` |

- **⚠️ Trigger discipline — do not use a catch-all trigger.** Each event tag must use an exact-match Custom Event trigger. A previous version (v4) fired all nine event tags on a single "All Events" / `{{Event}}` matches RegEx `.*` trigger, so every page load and every dataLayer push fired *all* events at once — `begin_checkout` (and every other event) was massively inflated and cross-contaminated. Fixed in v5. When adding a new event, give it its own Custom Event trigger; never reuse `.*`.
- **Purchase tracking is out of scope of this container.** Checkout completes on the Shopify-hosted domain (`christmas-shop-24-2.myshopify.com`), where this container does not run. To capture `purchase`, add GA4 (`G-XY6QN8BNWJ`) on the **Shopify side** (Google & YouTube channel / Customer Events) and enable **cross-domain measurement** for both domains in the GA4 data stream. Without this, GA4 shows `begin_checkout` but never `purchase`, even for completed orders.

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
