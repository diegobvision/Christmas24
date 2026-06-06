import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/shopify";
import ProductPageClient from "./ProductPageClient";
import JsonLd from "@/components/JsonLd/JsonLd";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://christmas24.co.uk";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product not found" };

  const url = `${siteUrl}/products/${handle}`;
  const image = product.featuredImage?.url;

  return {
    title: product.title,
    description: product.description?.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: product.title,
      description: product.description?.slice(0, 160),
      images: image ? [{ url: image, alt: product.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description?.slice(0, 160),
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const url = `${siteUrl}/products/${handle}`;
  const firstVariant = product.variants.nodes[0];
  const price = firstVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAtPrice = firstVariant?.compareAtPrice;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    url,
    image: product.images.nodes.map((img) => img.url),
    sku: firstVariant?.id ?? product.id,
    brand: {
      "@type": "Brand",
      name: "Christmas24",
    },
    offers: product.variants.nodes.map((variant) => ({
      "@type": "Offer",
      url,
      priceCurrency: variant.price.currencyCode,
      price: parseFloat(variant.price.amount).toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(variant.compareAtPrice && {
        highPrice: parseFloat(variant.compareAtPrice.amount).toFixed(2),
      }),
      name: variant.title !== "Default Title" ? variant.title : product.title,
      seller: {
        "@type": "Organization",
        name: "Christmas24",
      },
    })),
    ...(product.images.nodes.length > 0 && {
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
    }),
  };

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
        name: product.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ProductPageClient product={product} />
    </>
  );
}
