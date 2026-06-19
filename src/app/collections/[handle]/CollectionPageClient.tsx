"use client";

import ProductCard from "@/components/ProductCard/ProductCard";
import { filterUsed, toGTMProduct, viewItemList } from "@/lib/gtm";
import { Product, ShopifyImage } from "@/lib/shopify";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import styles from "./CollectionPage.module.scss";

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface CollectionData {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
}

interface Props {
  collection: CollectionData;
  initialProducts: Product[];
  pageInfo: PageInfo;
  currentSort: string;
  currentFilters: {
    available?: boolean;
    minPrice?: number;
    maxPrice?: number;
    tag?: string;
  };
  availableTags: string[];
}

const SORT_OPTIONS = [
  { label: "Featured", value: "" },
  { label: "Best Selling", value: "best_selling" },
  { label: "Newest", value: "created" },
  { label: "A–Z", value: "title" },
  { label: "Price: Low–High", value: "price" },
  { label: "Price: High–Low", value: "price-desc" },
];

export default function CollectionPageClient({
  collection,
  initialProducts,
  pageInfo,
  currentSort,
  currentFilters,
  availableTags,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(
    currentFilters.minPrice?.toString() ?? "",
  );
  const [maxPrice, setMaxPrice] = useState(
    currentFilters.maxPrice?.toString() ?? "",
  );

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      setFiltersOpen(event.matches);
    };

    setFiltersOpen(desktopMediaQuery.matches);
    desktopMediaQuery.addEventListener("change", handleDesktopChange);

    return () => {
      desktopMediaQuery.removeEventListener("change", handleDesktopChange);
    };
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));

    // GTM: filter_used
    if (value) {
      filterUsed({
        filterType: key as "tag" | "availability" | "price" | "sort",
        filterValue: value,
        collectionHandle: collection.handle,
      });
    }
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    startTransition(() => router.push(pathname));
  };

  const hasActiveFilters =
    currentSort ||
    currentFilters.available ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.tag;

  // GTM: view_item_list on mount and when products change
  useEffect(() => {
    if (initialProducts.length === 0) return;
    viewItemList({
      listId: collection.handle,
      listName: collection.title,
      items: initialProducts.map((p, i) =>
        toGTMProduct({
          id: p.id,
          handle: p.handle,
          title: p.title,
          price: p.priceRange.minVariantPrice.amount,
          currency: p.priceRange.minVariantPrice.currencyCode,
          index: i,
        }),
      ),
    });
  }, [initialProducts, collection.handle, collection.title]);

  return (
    <div className={styles.page}>
      {/* Collection header */}
      <div className={styles.collectionHeader}>
        {collection.image && (
          <div className={styles.headerImage}>
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              priority
              className={styles.headerImg}
              sizes="100vw"
            />
            <div className={styles.headerOverlay} />
          </div>
        )}
        <div
          className={`${styles.headerContent} ${!collection.image ? styles.noImage : ""}`}
        >
          <h1 className={styles.collectionTitle}>{collection.title}</h1>
          {collection.description && (
            <p className={styles.collectionDesc}>{collection.description}</p>
          )}
          <p className={styles.productCount}>
            {initialProducts.length} products
          </p>
        </div>
      </div>

      <div className={styles.body}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button
            className={`${styles.filterToggle} ${filtersOpen ? styles.active : ""}`}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <FilterIcon /> Filters
            {hasActiveFilters && <span className={styles.filterDot} />}
          </button>

          {hasActiveFilters && (
            <button className={styles.clearFilters} onClick={clearFilters}>
              Clear all
            </button>
          )}

          <div className={styles.spacer} />

          <label className={styles.sortLabel} htmlFor="sort-select">
            Sort by:
          </label>
          <select
            id="sort-select"
            className={styles.sortSelect}
            value={currentSort}
            onChange={(e) => {
              updateParam("sort", e.target.value);
              if (e.target.value) {
                filterUsed({
                  filterType: "sort",
                  filterValue: e.target.value,
                  collectionHandle: collection.handle,
                });
              }
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.layout}>
          {/* Filter panel */}
          <aside
            className={`${styles.filterPanel} ${filtersOpen ? styles.filterOpen : ""}`}
            aria-hidden={!filtersOpen}
          >
            <div className={styles.filterSection}>
              <h3 className={styles.filterHeading}>Availability</h3>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={currentFilters.available ?? false}
                  onChange={(e) =>
                    updateParam("available", e.target.checked ? "true" : "")
                  }
                />
                <span>In stock only</span>
              </label>
            </div>

            {availableTags.length > 0 && (
              <div className={styles.filterSection}>
                <h3 className={styles.filterHeading}>Tags</h3>
                <div className={styles.tagList}>
                  {availableTags.map((tag) => {
                    const isActive = currentFilters.tag === tag;
                    return (
                      <button
                        key={tag}
                        className={`${styles.tagBtn} ${isActive ? styles.tagActive : ""}`}
                        onClick={() => updateParam("tag", isActive ? "" : tag)}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.filterSection}>
              <h3 className={styles.filterHeading}>Price range</h3>
              <div className={styles.priceInputs}>
                <div className={styles.priceField}>
                  <label>Min</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="£0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={applyPriceFilter}
                    onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
                  />
                </div>
                <span className={styles.priceSep}>–</span>
                <div className={styles.priceField}>
                  <label>Max</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={applyPriceFilter}
                    onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className={styles.gridWrapper}>
            {isPending && (
              <div className={styles.loadingBar} aria-label="Loading" />
            )}
            {initialProducts.length === 0 ? (
              <div className={styles.empty}>
                <span aria-hidden="true">🔍</span>
                <p>No products found matching your filters.</p>
                <button className={styles.clearBtn} onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                className={`${styles.grid} ${filtersOpen ? styles.gridNarrow : ""}`}
              >
                {initialProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    listId={collection.handle}
                    listName={collection.title}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
