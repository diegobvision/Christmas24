/**
 * GTM / GA4 dataLayer utility
 *
 * All GA4 e-commerce events are pushed here. Components import the typed
 * helper functions — never push to dataLayer directly.
 *
 * GTM setup:
 *  1. Set NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX in .env.local
 *  2. In GTM, create one GA4 Configuration tag (fires on All Pages)
 *  3. Create GA4 Event tags triggered by the custom event names below,
 *     or use the dataLayer variable {{dlv - event}} to pass them through.
 *
 * CSS selector triggers (alternative/complementary):
 *  Elements with data-gtm="<value>" can be targeted in GTM click triggers
 *  using CSS selector  [data-gtm="<value>"]
 */

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

// ── Core push ──────────────────────────────────────────────────────────────

type DataLayerEvent = Record<string, unknown>;

export function pushEvent(event: DataLayerEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Clear previous ecommerce object before each push (GA4 requirement)
  if (event.ecommerce) window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(event);
}

// ── Shared types ───────────────────────────────────────────────────────────

export interface GTMProduct {
  item_id: string;
  item_name: string;
  price: number;
  currency: string;
  item_category?: string;
  item_variant?: string;
  index?: number;
  quantity?: number;
}

// ── E-commerce events ──────────────────────────────────────────────────────

/** Fire when a collection page or search results list is rendered */
export function viewItemList(params: {
  listId: string;
  listName: string;
  items: GTMProduct[];
}): void {
  pushEvent({
    event: "view_item_list",
    ecommerce: {
      item_list_id: params.listId,
      item_list_name: params.listName,
      items: params.items,
    },
  });
}

/** Fire when a user clicks a product card */
export function selectItem(params: {
  listId: string;
  listName: string;
  item: GTMProduct;
}): void {
  pushEvent({
    event: "select_item",
    ecommerce: {
      item_list_id: params.listId,
      item_list_name: params.listName,
      items: [params.item],
    },
  });
}

/** Fire when a product detail page is rendered */
export function viewItem(params: { item: GTMProduct }): void {
  pushEvent({
    event: "view_item",
    ecommerce: {
      currency: params.item.currency,
      value: params.item.price,
      items: [params.item],
    },
  });
}

/** Fire when a user adds a product to the cart */
export function addToCart(params: {
  item: GTMProduct;
  quantity: number;
}): void {
  pushEvent({
    event: "add_to_cart",
    ecommerce: {
      currency: params.item.currency,
      value: params.item.price * params.quantity,
      items: [{ ...params.item, quantity: params.quantity }],
    },
  });
}

/** Fire when the cart drawer is opened */
export function viewCart(params: {
  value: number;
  currency: string;
  items: GTMProduct[];
}): void {
  pushEvent({
    event: "view_cart",
    ecommerce: {
      currency: params.currency,
      value: params.value,
      items: params.items,
    },
  });
}

/** Fire when the user clicks "Proceed to Checkout" */
export function beginCheckout(params: {
  value: number;
  currency: string;
  items: GTMProduct[];
}): void {
  pushEvent({
    event: "begin_checkout",
    ecommerce: {
      currency: params.currency,
      value: params.value,
      items: params.items,
    },
  });
}

/** Fire when a search is submitted */
export function trackSearch(searchTerm: string): void {
  pushEvent({
    event: "search",
    search_term: searchTerm,
  });
}

// ── Engagement events ──────────────────────────────────────────────────────

/** Fire when a collection filter or sort is applied */
export function filterUsed(params: {
  filterType: "tag" | "availability" | "price" | "sort";
  filterValue: string;
  collectionHandle: string;
}): void {
  pushEvent({
    event: "filter_used",
    filter_type: params.filterType,
    filter_value: params.filterValue,
    collection: params.collectionHandle,
  });
}

/** Fire when a hero CTA is clicked */
export function heroCTAClick(label: string): void {
  pushEvent({
    event: "hero_cta_click",
    cta_label: label,
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convert a Shopify product + variant into a GTMProduct */
export function toGTMProduct(params: {
  id: string;
  handle: string;
  title: string;
  price: string;
  currency: string;
  variantTitle?: string;
  index?: number;
  quantity?: number;
}): GTMProduct {
  return {
    item_id: params.handle,
    item_name: params.title,
    price: parseFloat(params.price),
    currency: params.currency,
    ...(params.variantTitle &&
      params.variantTitle !== "Default Title" && {
        item_variant: params.variantTitle,
      }),
    ...(params.index !== undefined && { index: params.index }),
    ...(params.quantity !== undefined && { quantity: params.quantity }),
  };
}

// ── Global type augmentation ───────────────────────────────────────────────

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}
