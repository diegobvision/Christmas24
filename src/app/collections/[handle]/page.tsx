import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollection, getCollectionProducts, getCollectionTags, SortKey } from "@/lib/shopify";
import CollectionPageClient from "./CollectionPageClient";
import JsonLd from "@/components/JsonLd/JsonLd";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://christmas24.co.uk";

interface Props {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{
    sort?: string;
    available?: string;
    minPrice?: string;
    maxPrice?: string;
    tag?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) return { title: "Collection not found" };

  const url = `${siteUrl}/collections/${handle}`;
  const description = collection.description || `Shop our ${collection.title} collection`;

  return {
    title: collection.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${collection.title} | Christmas24`,
      description,
      images: collection.image ? [{ url: collection.image.url, alt: collection.title }] : [],
    },
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
    tag: sp.tag ?? undefined,
  };

  const [result, availableTags] = await Promise.all([
    getCollectionProducts(handle, { first: 24, sortKey, reverse, filters }),
    getCollectionTags(handle),
  ]);

  if (!result.collection) notFound();

  const url = `${siteUrl}/collections/${handle}`;
  const products = result.collection.products.nodes;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: result.collection.title,
        item: url,
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: result.collection.title,
    description: result.collection.description,
    url,
    ...(result.collection.image && {
      image: result.collection.image.url,
    }),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/products/${product.handle}`,
        name: product.title,
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <CollectionPageClient
        collection={result.collection}
        initialProducts={products}
        pageInfo={result.collection.products.pageInfo}
        currentSort={sp.sort ?? ""}
        currentFilters={filters}
        availableTags={availableTags}
      />
    </>
  );
}
