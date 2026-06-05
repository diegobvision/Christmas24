import Link from "next/link";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <span aria-hidden="true">❄</span> Christmas<em>24</em>
          </span>
          <p className={styles.tagline}>
            Spreading joy, one gift at a time.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>Shop</h4>
            <Link href="/collections/gifts">Gifts</Link>
            <Link href="/collections/decorations">Decorations</Link>
            <Link href="/search">Search all</Link>
          </div>
          <div className={styles.linkGroup}>
            <h4>Info</h4>
            <Link href="/pages/about">About us</Link>
            <Link href="/pages/shipping">Shipping & Returns</Link>
            <Link href="/pages/faq">FAQ</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} Christmas24. All rights reserved.</p>
        <div className={styles.snowflakes} aria-hidden="true">
          {'❄ ❅ ❆ ❄ ❅ ❆ ❄'.split(' ').map((s, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.3}s` }}>{s}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
