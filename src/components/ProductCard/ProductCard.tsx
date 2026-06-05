import Link from "next/link";
import Image from "next/image";
import { Product, formatMoney } from "@/lib/shopify";
import styles from "./ProductCard.module.scss";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const firstVariant = product.variants.nodes[0];
  const compareAtPrice = firstVariant?.compareAtPrice;
  const minPrice = product.priceRange.minVariantPrice;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(minPrice.amount);

  return (
    <Link href={`/products/${product.handle}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            <span aria-hidden="true">🎁</span>
          </div>
        )}

        {isOnSale && <span className={styles.saleBadge}>Sale</span>}
        {!product.availableForSale && (
          <div className={styles.soldOutOverlay}>
            <span>Sold Out</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{product.title}</h3>
        <div className={styles.pricing}>
          <span className={styles.price}>{formatMoney(minPrice)}</span>
          {isOnSale && compareAtPrice && (
            <span className={styles.compareAt}>{formatMoney(compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
