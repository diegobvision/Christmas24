# Shopify Storefront API — Setup Guide

Follow these steps once to connect your Shopify store to this Next.js app.

---

## Step 1 — Create a Custom App

1. In your Shopify admin go to **Settings → Apps and sales channels → Develop apps**.
2. Click **Allow custom app development** if prompted, then confirm.
3. Click **Create an app** and give it a name (e.g. `Christmas24 Storefront`).

---

## Step 2 — Configure Storefront API access

1. Inside the app, click the **Configuration** tab.
2. Under **Storefront API integration**, click **Configure**.
3. Enable the following scopes:
   - `unauthenticated_read_product_listings` — covers products **and** collections
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`

   > Note: `unauthenticated_read_collection_listings` no longer exists as a separate scope — collection access is bundled into `unauthenticated_read_product_listings`.
4. Click **Save**.
5. Go to the **API credentials** tab and click **Install app**.
6. Under **Storefront API access token**, copy the token shown.

---

## Step 3 — Find your store domain

Your store domain is the `.myshopify.com` URL shown in your browser when logged in:

```
https://your-store-name.myshopify.com/admin
         ^^^^^^^^^^^^^^^^^^^^^^^^
         This is your SHOPIFY_STORE_DOMAIN
```

---

## Step 4 — Create your `.env.local`

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token-here

# Comma-separated handles matching your Shopify collection handles
# Find handles in Shopify admin: Collections → click a collection → look at the URL
# e.g. https://admin.shopify.com/…/collections/123456789  ← not the handle
# The handle is shown under "Search engine listing" at the bottom of the page
NEXT_PUBLIC_NAV_COLLECTIONS=gifts,decorations,toys,stocking-fillers
```

---

## Step 5 — Finding collection handles

In Shopify admin:
1. Go to **Products → Collections**.
2. Click a collection.
3. Scroll to **Search engine listing** at the bottom.
4. The **URL handle** field shows the handle (e.g. `christmas-gifts`).

---

## Step 6 — Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Wrong access token | Re-copy from Shopify API credentials |
| `404` on collections | Wrong domain or API version | Check `SHOPIFY_STORE_DOMAIN` has no `https://` |
| Collections not in nav | Wrong handles | Check the exact URL handle in Shopify |
| Images not loading | Domain not in `next.config.ts` | Already configured for `cdn.shopify.com` ✓ |
