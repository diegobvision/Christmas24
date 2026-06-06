"use client";

import { useCart } from "@/context/CartContext";
import { toGTMProduct, viewItem } from "@/lib/gtm";
import { Product, ProductVariant, formatMoney } from "@/lib/shopify";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./ProductPage.module.scss";

interface Props {
  product: Product;
}

export default function ProductPageClient({ product }: Props) {
  const { addItem, isLoading } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0]])),
  );
  const [added, setAdded] = useState(false);

  const images = product.images.nodes;
  const currentImage = images[selectedImage] ?? product.featuredImage;

  const matchingVariant: ProductVariant | undefined =
    product.variants.nodes.find((v) =>
      v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value),
    );

  const canAddToCart = matchingVariant?.availableForSale ?? false;
  const price = matchingVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = matchingVariant?.compareAtPrice;
  const isOnSale =
    compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);

  // GTM: view_item on mount
  useEffect(() => {
    viewItem({
      item: toGTMProduct({
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: price.amount,
        currency: price.currencyCode,
        variantTitle: matchingVariant?.title,
      }),
    });
    // only fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCart = async () => {
    if (!matchingVariant || !canAddToCart) return;
    await addItem(matchingVariant.id, 1, {
      handle: product.handle,
      title: product.title,
      price: price.amount,
      currency: price.currencyCode,
      variantTitle: matchingVariant.title,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hasOptions = product.options.some((o) => o.values.length > 1);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.altText ?? product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.mainImg}
              />
            ) : (
              <div className={styles.noImage}>🎁</div>
            )}
            {isOnSale && <span className={styles.saleBadge}>Sale</span>}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ""}`}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `${product.title} image ${i + 1}`}
                    fill
                    sizes="80px"
                    className={styles.thumbImg}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className={styles.info}>
          <div className={styles.breadcrumb}>
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.pricing}>
            <span className={styles.price}>{formatMoney(price)}</span>
            {isOnSale && compareAt && (
              <>
                <span className={styles.compareAt}>
                  {formatMoney(compareAt)}
                </span>
                <span className={styles.saveBadge}>
                  Save{" "}
                  {Math.round(
                    (1 -
                      parseFloat(price.amount) / parseFloat(compareAt.amount)) *
                      100,
                  )}
                  %
                </span>
              </>
            )}
          </div>

          {/* Options */}
          {hasOptions &&
            product.options.map(
              (option) =>
                option.values.length > 1 && (
                  <div key={option.name} className={styles.optionGroup}>
                    <p className={styles.optionLabel}>
                      {option.name}:{" "}
                      <strong>{selectedOptions[option.name]}</strong>
                    </p>
                    <div className={styles.optionValues}>
                      {option.values.map((val) => {
                        const testVariant = product.variants.nodes.find((v) =>
                          v.selectedOptions.every((o) =>
                            o.name === option.name
                              ? o.value === val
                              : selectedOptions[o.name] === o.value,
                          ),
                        );
                        const available =
                          testVariant?.availableForSale ?? false;

                        return (
                          <button
                            key={val}
                            className={`${styles.optionBtn} ${
                              selectedOptions[option.name] === val
                                ? styles.optionSelected
                                : ""
                            } ${!available ? styles.optionUnavailable : ""}`}
                            onClick={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [option.name]: val,
                              }))
                            }
                            disabled={!available}
                            title={!available ? "Out of stock" : val}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ),
            )}

          {/* Add to cart */}
          <div className={styles.addToCart}>
            <button
              className={`${styles.addBtn} ${added ? styles.addedBtn : ""}`}
              onClick={handleAddToCart}
              disabled={!canAddToCart || isLoading}
              data-gtm="add-to-cart"
              data-gtm-product={product.handle}
            >
              {!product.availableForSale
                ? "Sold Out"
                : !canAddToCart
                  ? "Unavailable"
                  : isLoading
                    ? "Adding…"
                    : added
                      ? "✓ Added to Cart!"
                      : "Add to Cart"}
            </button>
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          {/* Perks
          <div className={styles.perks}>
            {[
              { icon: "🚚", text: "Free UK delivery over £50" },
              { icon: "↩️", text: "30-day returns" },
              { icon: "🎁", text: "Gift wrapping available" },
            ].map(({ icon, text }) => (
              <div key={text} className={styles.perk}>
                <span aria-hidden="true">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
}
