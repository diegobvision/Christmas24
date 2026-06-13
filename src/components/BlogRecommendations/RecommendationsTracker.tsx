"use client";

import { useEffect } from "react";
import { Product } from "@/lib/shopify";
import { viewRecommendations, toGTMProduct } from "@/lib/gtm";

interface Props {
  listId: string;
  listName: string;
  products: Product[];
}

/** Fires a view_item_list event once when the recommendations block mounts. */
export default function RecommendationsTracker({ listId, listName, products }: Props) {
  useEffect(() => {
    viewRecommendations({
      listId,
      listName,
      items: products.map((p, index) =>
        toGTMProduct({
          id: p.id,
          handle: p.handle,
          title: p.title,
          price: p.priceRange.minVariantPrice.amount,
          currency: p.priceRange.minVariantPrice.currencyCode,
          index,
        })
      ),
    });
    // fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
