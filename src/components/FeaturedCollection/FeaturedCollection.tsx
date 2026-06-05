import Link from "next/link";
import { getFeaturedCollectionProducts, getCollection } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./FeaturedCollection.module.scss";

interface Props {
  handle: string;
}

export default async function FeaturedCollection({ handle }: Props) {
  const [collection, products] = await Promise.all([
    getCollection(handle),
    getFeaturedCollectionProducts(handle, 4),
  ]);

  if (!collection || products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{collection.title}</h2>
          {collection.description && (
            <p className={styles.description}>{collection.description}</p>
          )}
        </div>
        <Link href={`/collections/${handle}`} className={styles.viewAll}>
          View all →
        </Link>
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
