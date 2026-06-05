import { Suspense } from "react";
import { getNavCollectionHandles } from "@/lib/shopify";
import HeroBanner from "@/components/HeroBanner/HeroBanner";
import FeaturedCollection from "@/components/FeaturedCollection/FeaturedCollection";
import styles from "./page.module.scss";

export const revalidate = 60;

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
    </>
  );
}
