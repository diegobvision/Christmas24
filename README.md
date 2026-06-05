# ❄️ Christmas24

A classy, playful headless Christmas retail storefront built with **Next.js 15** and the **Shopify Storefront API**.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Shopify](https://img.shields.io/badge/Shopify-Storefront_API-96bf48?logo=shopify)
![SCSS](https://img.shields.io/badge/Styles-SCSS_Modules-cc6699?logo=sass)

---

## ✨ Features

- 🎄 **Christmas-themed design** — deep red, forest green & gold palette with festive animations
- 🛍️ **Collections navigation** — driven entirely by a single env variable, no code changes needed to add or remove categories
- 📦 **Product catalogue** — collection pages with filters (availability, price range) and six sort options
- 🔍 **Search** — full-text product search powered by the Storefront API
- 🛒 **Cart drawer** — slide-in cart with quantity controls, persisted across page refreshes
- 💳 **Checkout** — seamless redirect to Shopify-hosted checkout
- 📱 **Fully responsive** — five breakpoints from 320px phones to wide desktops, with a mobile hamburger menu
- ⚡ **ISR** — statically generated pages revalidated every 60 seconds for fast loads and fresh data

---

## 🖥️ Pages

| Route | Description |
|---|---|
| `/` | Homepage — animated hero banner + featured products per collection |
| `/collections/[handle]` | Collection page — product grid, filters, sort |
| `/products/[handle]` | Product detail — image gallery, variant picker, add to cart |
| `/search?q=` | Search results |

---

## 🚀 Getting started

### Prerequisites

- Node.js 18+
- A Shopify store with the **Headless** sales channel installed

### 1. Clone the repo

```bash
git clone https://github.com/your-username/christmas24.git
cd christmas24
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-public-token
NEXT_PUBLIC_NAV_COLLECTIONS=tree-decorations,gifts,stocking-fillers
```

See [SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md) for step-by-step instructions on obtaining these values.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎅

---

## 🧭 Navigation collections

Collections are driven entirely by the `NEXT_PUBLIC_NAV_COLLECTIONS` env variable — a comma-separated list of Shopify collection handles:

```env
NEXT_PUBLIC_NAV_COLLECTIONS=tree-decorations,gifts,toys,stocking-fillers
```

Add or remove a handle and restart the server — the navbar updates automatically. No code changes needed.

> **Finding a collection handle:** in Shopify Admin go to a collection page and scroll to **Search engine listing** at the bottom. The handle is shown there (e.g. `tree-decorations`).

---

## 🎨 Design system

Styles are written in **SCSS Modules** — every component has a colocated `.module.scss` file. The global design tokens live in `src/styles/`:

| File | Contents |
|---|---|
| `_variables.scss` | Colours, spacing scale, typography, shadows, z-indices |
| `_mixins.scss` | Breakpoint helpers, layout, button styles, card styles |
| `globals.scss` | Reset, body defaults, Google Fonts import |

### Colour palette

| | Name | Hex |
|---|---|---|
| 🔴 | Christmas Red | `#C41E3A` |
| 🟢 | Forest Green | `#165B33` |
| 🟡 | Gold | `#D4AF37` |
| 🟤 | Cream | `#FAFAF0` |

---

## 🏗️ Project structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── collections/[handle]/   # Collection page
│   ├── products/[handle]/      # Product detail page
│   └── search/                 # Search results
├── components/                 # UI components (each with .module.scss)
│   ├── Navbar/
│   ├── MobileMenu/
│   ├── SearchBar/
│   ├── CartDrawer/
│   ├── ProductCard/
│   ├── HeroBanner/
│   ├── FeaturedCollection/
│   └── Footer/
├── context/
│   └── CartContext.tsx          # Cart state & Shopify cart mutations
├── lib/
│   └── shopify.ts               # Storefront API client + all GraphQL queries
└── styles/
    ├── _variables.scss
    ├── _mixins.scss
    └── globals.scss
```

---

## 🛠️ Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📋 Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | ✅ | Your `.myshopify.com` domain |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | ✅ | Public Storefront API token from Headless channel |
| `NEXT_PUBLIC_NAV_COLLECTIONS` | ✅ | Comma-separated collection handles for the navbar |

---

## 📦 Tech stack

- [Next.js 15](https://nextjs.org/) — App Router, React Server Components, ISR
- [TypeScript](https://www.typescriptlang.org/)
- [Sass/SCSS](https://sass-lang.com/) — CSS Modules
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront) — GraphQL, v2024-10
- [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) + [Lato](https://fonts.google.com/specimen/Lato) — Google Fonts

---

*Made with ❤️ and a sprinkle of ✨ festive magic*
