import Link from "next/link";
import {
  getProductsByTags,
  getFeaturedCollectionProducts,
  getCollection,
  getNavCollectionHandles,
  Product,
} from "@/lib/shopify";
import ProductCard from "@/components/ProductCard/ProductCard";
import RecommendationsTracker from "./RecommendationsTracker";
import styles from "./BlogRecommendations.module.scss";

interface Props {
  /** Tags of the article — products sharing any of these are surfaced */
  tags: string[];
  /** How many products to show */
  first?: number;
}

const LIST_ID = "blog-recommendations";

export default async function BlogRecommendations({ tags, first = 4 }: Props) {
  // 1. Try products that share the article's tags.
  let products: Product[] = await getProductsByTags(tags, first);
  let listName = "Blog Recommendations: Tag Match";
  let fallbackHandle: string | null = null;

  // 2. Fall back to the first collection in NEXT_PUBLIC_NAV_COLLECTIONS.
  if (products.length === 0) {
    fallbackHandle = getNavCollectionHandles()[0] ?? null;
    if (fallbackHandle) {
      products = await getFeaturedCollectionProducts(fallbackHandle, first);
      const collection = await getCollection(fallbackHandle);
      listName = `Blog Recommendations: ${collection?.title ?? fallbackHandle}`;
    }
  }

  if (products.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-gtm="blog-recommendations"
      data-gtm-rec-source={fallbackHandle ? "collection-fallback" : "tag-match"}
    >
      <RecommendationsTracker
        listId={LIST_ID}
        listName={listName}
        products={products}
      />

      <div className={styles.header}>
        <h2 className={styles.title}>You might also like</h2>
        {fallbackHandle && (
          <Link href={`/collections/${fallbackHandle}`} className={styles.viewAll}>
            View all →
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            listId={LIST_ID}
            listName={listName}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
