import type { Metadata } from "next";
import { searchProducts } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard/ProductCard";
import SearchInput from "./SearchInput";
import styles from "./SearchPage.module.scss";

export const revalidate = 30;

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: "${q}"` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {query ? (
              <>
                Results for <em>"{query}"</em>
              </>
            ) : (
              "Search"
            )}
          </h1>
          {query && (
            <p className={styles.count}>
              {products.length} {products.length === 1 ? "product" : "products"} found
            </p>
          )}
          <SearchInput initialQuery={query} />
        </div>

        {!query && (
          <div className={styles.prompt}>
            <span aria-hidden="true">🔍</span>
            <p>Type above to find gifts and decorations.</p>
          </div>
        )}

        {query && products.length === 0 && (
          <div className={styles.noResults}>
            <span aria-hidden="true">🤷</span>
            <p>No products found for <strong>"{query}"</strong></p>
            <p className={styles.noResultsSub}>Try a different search term or browse our collections.</p>
          </div>
        )}

        {products.length > 0 && (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
