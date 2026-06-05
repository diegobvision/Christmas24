import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollection, getCollectionProducts, SortKey } from "@/lib/shopify";
import CollectionPageClient from "./CollectionPageClient";

export const revalidate = 60;

interface Props {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{
    sort?: string;
    available?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.title,
    description: collection.description || `Shop our ${collection.title} collection`,
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const sp = await searchParams;

  const rawSort = sp.sort ?? "";
  const reverse = rawSort === "price-desc";
  const sortKey: SortKey =
    rawSort === "price-desc" || rawSort === "price"
      ? "PRICE"
      : rawSort === "best_selling"
      ? "BEST_SELLING"
      : rawSort === "created"
      ? "CREATED"
      : rawSort === "title"
      ? "TITLE"
      : "COLLECTION_DEFAULT";

  const filters = {
    available: sp.available === "true",
    minPrice: sp.minPrice ? parseFloat(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? parseFloat(sp.maxPrice) : undefined,
  };

  const result = await getCollectionProducts(handle, {
    first: 24,
    sortKey,
    reverse,
    filters,
  });

  if (!result.collection) notFound();

  return (
    <CollectionPageClient
      collection={result.collection}
      initialProducts={result.collection.products.nodes}
      pageInfo={result.collection.products.pageInfo}
      currentSort={sp.sort ?? ""}
      currentFilters={filters}
    />
  );
}
