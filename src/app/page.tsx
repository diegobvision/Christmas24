import { Suspense } from "react";
import type { Metadata } from "next";
import { getNavCollectionHandles } from "@/lib/shopify";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import FeaturedCollection from "@/components/FeaturedCollection/FeaturedCollection";
import PodcastSection from "@/components/PodcastSection/PodcastSection";
import JsonLd from "@/components/JsonLd/JsonLd";
import styles from "./page.module.scss";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://christmas24.co.uk";

export const metadata: Metadata = {
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Christmas24 — Gifts & Decorations",
    description:
      "Discover our magical selection of Christmas gifts, decorations, and festive essentials. Free UK delivery over £50.",
  },
};

const storeSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Christmas24",
  description:
    "A curated Christmas retail store offering gifts, decorations, and festive essentials.",
  url: siteUrl,
  currenciesAccepted: "GBP",
  paymentAccepted: "Credit Card, Debit Card",
  priceRange: "££",
  openingHours: "Mo-Su 00:00-23:59",
  hasMap: false,
};

function CollectionSkeleton() {
  return (
    <div className={styles.skeletonSection}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const handles = getNavCollectionHandles();

  return (
    <>
      <JsonLd data={storeSchema} />
      <HeroBanner />

      <div id="featured" className={styles.featured}>
        <div className={styles.container}>
          {handles.map((handle) => (
            <Suspense key={handle} fallback={<CollectionSkeleton />}>
              <FeaturedCollection handle={handle} />
              <hr className={styles.divider} />
            </Suspense>
          ))}

          {handles.length === 0 && (
            <div className={styles.noCollections}>
              <p>
                Set <code>NEXT_PUBLIC_NAV_COLLECTIONS</code> in your{" "}
                <code>.env.local</code> to display collections here.
              </p>
            </div>
          )}
        </div>
      </div>

      <PodcastSection spotifyShowId="033uGM5v7AfjVpJAUdB29u" />
    </>
  );
}
