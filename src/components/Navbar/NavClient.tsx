"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collection } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";
import MobileMenu from "@/components/MobileMenu/MobileMenu";
import SearchBar from "@/components/SearchBar/SearchBar";
import styles from "./Navbar.module.scss";

interface Props {
  collections: Collection[];
}

export default function NavClient({ collections }: Props) {
  const pathname = usePathname();
  const { cart, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon} aria-hidden="true">❄</span>
            <span className={styles.logoText}>Christmas<em>24</em></span>
          </Link>

          {/* Desktop nav */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            {collections.map((col) => (
              <Link
                key={col.handle}
                href={`/collections/${col.handle}`}
                className={`${styles.navLink} ${
                  pathname === `/collections/${col.handle}` ? styles.active : ""
                }`}
              >
                {col.title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            <button
              className={styles.iconBtn}
              onClick={openCart}
              aria-label={`Cart, ${itemCount} items`}
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className={styles.badge}>{itemCount}</span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              className={`${styles.iconBtn} ${styles.hamburger}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        collections={collections}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
