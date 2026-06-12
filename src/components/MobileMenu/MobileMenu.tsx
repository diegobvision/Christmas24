"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Collection } from "@/lib/shopify";
import styles from "./MobileMenu.module.scss";

interface Props {
  collections: Collection[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ collections, isOpen, onClose }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.visible : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${isOpen ? styles.open : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className={styles.header}>
          <Image
            src="/logo-light.svg"
            alt="Christmas Shop 24"
            width={120}
            height={49}
            className={styles.logo}
          />
          <button className={styles.close} onClick={onClose} aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
          >
            <span className={styles.linkIcon}>🏠</span> Home
          </Link>
          <div className={styles.divider} />
          <p className={styles.sectionLabel}>Collections</p>
          {collections.map((col) => (
            <Link
              key={col.handle}
              href={`/collections/${col.handle}`}
              className={`${styles.link} ${
                pathname === `/collections/${col.handle}` ? styles.active : ""
              }`}
            >
              <span className={styles.linkIcon}>🎁</span> {col.title}
            </Link>
          ))}
          <div className={styles.divider} />
          <Link href="/search" className={styles.link}>
            <span className={styles.linkIcon}>🔍</span> Search
          </Link>
        </nav>

        <div className={styles.footer}>
          <p>✨ Free delivery on orders over £50</p>
        </div>
      </aside>
    </>
  );
}
