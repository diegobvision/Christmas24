"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/shopify";
import { beginCheckout, toGTMProduct } from "@/lib/gtm";
import styles from "./CartDrawer.module.scss";

export default function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, updateItem, removeItem } = useCart();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const lines = cart?.lines.nodes ?? [];

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.visible : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${isOpen ? styles.open : ""}`}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            Your Cart
            {(cart?.totalQuantity ?? 0) > 0 && (
              <span className={styles.count}>{cart!.totalQuantity}</span>
            )}
          </h2>
          <button className={styles.close} onClick={closeCart} aria-label="Close cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={`${styles.body} ${isLoading ? styles.loading : ""}`}>
          {lines.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">🛍️</span>
              <p>Your cart is empty</p>
              <button className={styles.shopBtn} onClick={closeCart}>
                Start shopping
              </button>
            </div>
          ) : (
            <ul className={styles.lineList}>
              {lines.map((line) => {
                const img = line.merchandise.product.featuredImage;
                return (
                  <li key={line.id} className={styles.lineItem}>
                    <div className={styles.lineImage}>
                      {img ? (
                        <Image
                          src={img.url}
                          alt={img.altText ?? line.merchandise.product.title}
                          fill
                          sizes="80px"
                          className={styles.productImage}
                        />
                      ) : (
                        <span aria-hidden="true">🎁</span>
                      )}
                    </div>
                    <div className={styles.lineInfo}>
                      <Link
                        href={`/products/${line.merchandise.product.handle}`}
                        className={styles.productTitle}
                        onClick={closeCart}
                      >
                        {line.merchandise.product.title}
                      </Link>
                      {line.merchandise.title !== "Default Title" && (
                        <p className={styles.variantTitle}>{line.merchandise.title}</p>
                      )}
                      <div className={styles.lineFooter}>
                        <div className={styles.qtyControl}>
                          <button
                            onClick={() => updateItem(line.id, line.quantity - 1)}
                            disabled={line.quantity <= 1}
                            aria-label="Decrease quantity"
                          >−</button>
                          <span>{line.quantity}</span>
                          <button
                            onClick={() => updateItem(line.id, line.quantity + 1)}
                            aria-label="Increase quantity"
                          >+</button>
                        </div>
                        <span className={styles.linePrice}>
                          {formatMoney({
                            amount: String(
                              parseFloat(line.merchandise.price.amount) * line.quantity
                            ),
                            currencyCode: line.merchandise.price.currencyCode,
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(line.id)}
                      aria-label="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && cart && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span className={styles.subtotalAmount}>
                {formatMoney(cart.cost.subtotalAmount)}
              </span>
            </div>
            <p className={styles.taxNote}>Taxes and shipping calculated at checkout</p>
            <a
              href={cart.checkoutUrl}
              className={styles.checkoutBtn}
              data-gtm="begin-checkout"
              onClick={() =>
                beginCheckout({
                  currency: cart.cost.totalAmount.currencyCode,
                  value: parseFloat(cart.cost.totalAmount.amount),
                  items: cart.lines.nodes.map((line) =>
                    toGTMProduct({
                      id: line.merchandise.id,
                      handle: line.merchandise.product.handle,
                      title: line.merchandise.product.title,
                      price: line.merchandise.price.amount,
                      currency: line.merchandise.price.currencyCode,
                      variantTitle: line.merchandise.title,
                      quantity: line.quantity,
                    })
                  ),
                })
              }
            >
              Proceed to Checkout →
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
