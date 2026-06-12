"use client";

import Link from "next/link";
import Image from "next/image";
import { heroCTAClick } from "@/lib/gtm";
import styles from "./HeroBanner.module.scss";

export default function HeroBanner() {
  return (
    <section className={styles.hero}>
      <div className={styles.decorations} aria-hidden="true">
        {["❄", "❅", "❆", "❄", "❅", "❆", "❄", "❅"].map((s, i) => (
          <span
            key={i}
            className={styles.snowflake}
            style={{
              left: `${10 + i * 11}%`,
              animationDuration: `${4 + (i % 3)}s`,
              animationDelay: `${i * 0.4}s`,
              fontSize: `${1.2 + (i % 3) * 0.6}rem`,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className={styles.content}>
        <Image
          src="/logo-light.svg"
          alt="Christmas Shop 24"
          width={380}
          height={153}
          priority
          className={styles.heroLogo}
        />
        <p className={styles.eyebrow}>✦ The Christmas Collection ✦</p>
        <h1 className={styles.headline}>
          Make This Christmas
          <br />
          <em>Truly Magical</em>
        </h1>
        {/* <p className={styles.subtext}>
          Discover thoughtfully curated gifts, enchanting decorations, and
          festive treasures for everyone on your list.
        </p> */}
        <div className={styles.ctas}>
          {/* <Link
            href="/search"
            className={styles.ctaPrimary}
            onClick={() => heroCTAClick("Shop All Gifts")}
            data-gtm="hero-cta"
            data-gtm-label="shop-all-gifts"
          >
            Shop All Gifts
          </Link> */}
          <Link
            href="#featured"
            className={styles.ctaSecondary}
            onClick={() => heroCTAClick("Explore Collections")}
            data-gtm="hero-cta"
            data-gtm-label="explore-collections"
          >
            Explore Collections ↓
          </Link>
        </div>
      </div>

      <div className={styles.ornaments} aria-hidden="true">
        <span className={`${styles.ornament} ${styles.ornamentRed}`}>●</span>
        <span className={`${styles.ornament} ${styles.ornamentGold}`}>●</span>
        <span className={`${styles.ornament} ${styles.ornamentGreen}`}>●</span>
      </div>
    </section>
  );
}
