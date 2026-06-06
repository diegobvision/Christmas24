const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const endpoint = `https://${domain}/api/2024-10/graphql.json`;

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
  selectedOptions: { name: string; value: string }[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: MoneyV2; maxVariantPrice: MoneyV2 };
  variants: { nodes: ProductVariant[] };
  options: { name: string; values: string[] }[];
  tags: string[];
  availableForSale: boolean;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: MoneyV2;
    product: { title: string; handle: string; featuredImage: ShopifyImage | null };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: MoneyV2; subtotalAmount: MoneyV2 };
  lines: { nodes: CartLine[] };
}

// ── Fragments ──────────────────────────────────────────────────────────────

const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCard on Product {
    id
    handle
    title
    availableForSale
    featuredImage { url altText width height }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 1) {
      nodes {
        id
        compareAtPrice { amount currencyCode }
      }
    }
    tags
  }
`;

// ── Collections nav ────────────────────────────────────────────────────────

export async function getCollectionsByHandles(handles: string[]): Promise<Collection[]> {
  const queries = handles.map(
    (handle, i) => `
    c${i}: collectionByHandle(handle: "${handle}") {
      id handle title description
      image { url altText width height }
    }
  `
  );

  const data = await shopifyFetch<Record<string, Collection | null>>(
    `{ ${queries.join("\n")} }`
  );

  return handles
    .map((_, i) => data[`c${i}`])
    .filter((c): c is Collection => c !== null);
}

export async function getCollection(handle: string): Promise<Collection | null> {
  const data = await shopifyFetch<{ collectionByHandle: Collection | null }>(
    `query GetCollection($handle: String!) {
      collectionByHandle(handle: $handle) {
        id handle title description
        image { url altText width height }
      }
    }`,
    { handle }
  );
  return data.collectionByHandle;
}

// ── Collection products ────────────────────────────────────────────────────

export type SortKey =
  | "COLLECTION_DEFAULT"
  | "BEST_SELLING"
  | "PRICE"
  | "CREATED"
  | "TITLE";

export interface CollectionFilterValue {
  id: string;
  label: string;
  count: number;
  input: string; // JSON string, e.g. '{"tag":"christmas-tree"}'
}

export interface CollectionFilter {
  id: string;
  label: string;
  type: string;
  values: CollectionFilterValue[];
}

export interface CollectionProductsResult {
  collection: {
    id: string;
    handle: string;
    title: string;
    description: string;
    image: ShopifyImage | null;
    products: {
      nodes: Product[];
      filters: CollectionFilter[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
}

export async function getCollectionProducts(
  handle: string,
  {
    first = 24,
    after,
    sortKey = "COLLECTION_DEFAULT",
    reverse = false,
    filters,
  }: {
    first?: number;
    after?: string;
    sortKey?: SortKey;
    reverse?: boolean;
    filters?: { available?: boolean; minPrice?: number; maxPrice?: number; tag?: string };
  } = {}
): Promise<CollectionProductsResult> {
  const productFilters: unknown[] = [];
  if (filters?.available) productFilters.push({ available: true });
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    productFilters.push({
      price: {
        ...(filters.minPrice !== undefined ? { min: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { max: filters.maxPrice } : {}),
      },
    });
  }
  if (filters?.tag) productFilters.push({ tag: filters.tag });

  return shopifyFetch<CollectionProductsResult>(
    `query GetCollectionProducts(
      $handle: String!
      $first: Int!
      $after: String
      $sortKey: ProductCollectionSortKeys
      $reverse: Boolean
      $filters: [ProductFilter!]
    ) {
      collection: collectionByHandle(handle: $handle) {
        id handle title description
        image { url altText width height }
        products(
          first: $first
          after: $after
          sortKey: $sortKey
          reverse: $reverse
          filters: $filters
        ) {
          nodes { ...ProductCard }
          filters {
            id
            label
            type
            values { id label count input }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
    ${PRODUCT_CARD_FRAGMENT}`,
    {
      handle,
      first,
      after: after ?? null,
      sortKey,
      reverse,
      filters: productFilters.length > 0 ? productFilters : undefined,
    }
  );
}

// ── Single product ─────────────────────────────────────────────────────────

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ productByHandle: Product | null }>(
    `query GetProduct($handle: String!) {
      productByHandle(handle: $handle) {
        id handle title description descriptionHtml
        availableForSale
        featuredImage { url altText width height }
        images(first: 10) { nodes { url altText width height } }
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        variants(first: 100) {
          nodes {
            id title availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
          }
        }
        options { name values }
        tags
      }
    }`,
    { handle }
  );
  return data.productByHandle;
}

// ── Search ─────────────────────────────────────────────────────────────────

export async function searchProducts(
  query: string,
  first = 24
): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { nodes: Product[] } }>(
    `query SearchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        nodes { ...ProductCard }
      }
    }
    ${PRODUCT_CARD_FRAGMENT}`,
    { query, first }
  );
  return data.products.nodes;
}

// ── All tags for a collection (for filter panel) ───────────────────────────

export async function getCollectionTags(handle: string): Promise<string[]> {
  // Fetch up to 250 products to collect all unique tags
  const data = await shopifyFetch<{
    collectionByHandle: { products: { nodes: { tags: string[] }[] } } | null;
  }>(
    `query GetCollectionTags($handle: String!) {
      collectionByHandle(handle: $handle) {
        products(first: 250) {
          nodes { tags }
        }
      }
    }`,
    { handle }
  );

  const allTags = data.collectionByHandle?.products.nodes.flatMap((p) => p.tags) ?? [];
  // Deduplicate, sort alphabetically, filter empty strings
  return [...new Set(allTags)].filter(Boolean).sort((a, b) => a.localeCompare(b));
}

// ── Featured collections for homepage ─────────────────────────────────────

export async function getFeaturedCollectionProducts(
  handle: string,
  first = 4
): Promise<Product[]> {
  const data = await shopifyFetch<{
    collectionByHandle: { products: { nodes: Product[] } } | null;
  }>(
    `query GetFeatured($handle: String!, $first: Int!) {
      collectionByHandle(handle: $handle) {
        products(first: $first, sortKey: BEST_SELLING) {
          nodes { ...ProductCard }
        }
      }
    }
    ${PRODUCT_CARD_FRAGMENT}`,
    { handle, first }
  );
  return data.collectionByHandle?.products.nodes ?? [];
}

// ── Cart ───────────────────────────────────────────────────────────────────

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id quantity
        merchandise {
          ... on ProductVariant {
            id title
            price { amount currencyCode }
            product {
              title handle
              featuredImage { url altText width height }
            }
          }
        }
      }
    }
  }
`;

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: Cart } }>(
    `mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartFields }
      }
    }
    ${CART_FRAGMENT}`,
    { lines }
  );
  return data.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
      }
    }
    ${CART_FRAGMENT}`,
    { cartId, lines }
  );
  return data.cartLinesAdd.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: Cart } }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
      }
    }
    ${CART_FRAGMENT}`,
    { cartId, lines }
  );
  return data.cartLinesUpdate.cart;
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: Cart } }>(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
      }
    }
    ${CART_FRAGMENT}`,
    { cartId, lineIds }
  );
  return data.cartLinesRemove.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: Cart | null }>(
    `query GetCart($cartId: ID!) {
      cart(id: $cartId) { ...CartFields }
    }
    ${CART_FRAGMENT}`,
    { cartId }
  );
  return data.cart;
}

// ── Pages (Shopify CMS pages) ──────────────────────────────────────────────

export interface ShopifyPage {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  createdAt: string;
  updatedAt: string;
  seo: { title: string | null; description: string | null };
}

export async function getPage(handle: string): Promise<ShopifyPage | null> {
  const data = await shopifyFetch<{ page: ShopifyPage | null }>(
    `query GetPage($handle: String!) {
      page(handle: $handle) {
        id title handle body bodySummary createdAt updatedAt
        seo { title description }
      }
    }`,
    { handle }
  );
  return data.page;
}

export async function getAllPageHandles(): Promise<{ handle: string; updatedAt: string }[]> {
  const data = await shopifyFetch<{
    pages: { nodes: { handle: string; updatedAt: string }[] };
  }>(
    `query GetAllPageHandles {
      pages(first: 250) {
        nodes { handle updatedAt }
      }
    }`
  );
  return data.pages.nodes;
}

// ── Metaobjects (structured CMS content) ───────────────────────────────────

export interface MetaobjectField {
  key: string;
  value: string | null;
}

export interface Metaobject {
  id: string;
  handle: string;
  fields: MetaobjectField[];
}

export async function getMetaobjects(type: string, first = 50): Promise<Metaobject[]> {
  const data = await shopifyFetch<{
    metaobjects: { nodes: Metaobject[] };
  }>(
    `query GetMetaobjects($type: String!, $first: Int!) {
      metaobjects(type: $type, first: $first, sortKey: "position") {
        nodes {
          id
          handle
          fields { key value }
        }
      }
    }`,
    { type, first }
  );
  return data.metaobjects.nodes;
}

/** Helper: pull a field value by key from a metaobject */
export function metafield(obj: Metaobject, key: string): string {
  return obj.fields.find((f) => f.key === key)?.value ?? "";
}

// ── Sitemap ────────────────────────────────────────────────────────────────

type ProductHandlePage = {
  products: {
    nodes: { handle: string; updatedAt: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
};

export async function getAllProductHandles(): Promise<
  { handle: string; updatedAt: string }[]
> {
  const allProducts: { handle: string; updatedAt: string }[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data: ProductHandlePage = await shopifyFetch<ProductHandlePage>(
      `query GetAllProductHandles($cursor: String) {
        products(first: 250, after: $cursor) {
          nodes { handle updatedAt }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor }
    );
    allProducts.push(...data.products.nodes);
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = hasNextPage ? data.products.pageInfo.endCursor : null;
  }

  return allProducts;
}

export async function getAllCollectionHandles(): Promise<
  { handle: string; updatedAt: string }[]
> {
  const data = await shopifyFetch<{
    collections: { nodes: { handle: string; updatedAt: string }[] };
  }>(
    `query GetAllCollectionHandles {
      collections(first: 250) {
        nodes { handle updatedAt }
      }
    }`
  );
  return data.collections.nodes;
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function formatMoney(money: MoneyV2): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

export function getNavCollectionHandles(): string[] {
  const raw = process.env.NEXT_PUBLIC_NAV_COLLECTIONS ?? "";
  return raw
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
}
