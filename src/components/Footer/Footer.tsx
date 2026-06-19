import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image
            src="/logo-light.svg"
            alt="Christmas Shop 24"
            width={200}
            height={81}
            className={styles.logo}
          />
          <p className={styles.tagline}>Spreading joy, one gift at a time.</p>
          <div className={styles.socials}>
            <a
              href="https://www.facebook.com/people/Christmas-Shop-24/61590635664887/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Christmas Shop 24 on Facebook"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/thatchristmasshop"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Christmas Shop 24 on Instagram"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@thatchristmasshop"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Christmas Shop 24 on TikTok"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
              </svg>
            </a>
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>Shop</h4>
            <Link href="/search">All products</Link>
            <Link href="/search?q=gifts">Gifts</Link>
            <Link href="/search?q=decorations">Decorations</Link>
          </div>
          <div className={styles.linkGroup}>
            <h4>Info</h4>
            <Link href="/pages/about-us">About us</Link>
            <Link href="/pages/shipping-and-returns">Shipping & Returns</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} Christmas Shop 24. All rights reserved.</p>
        <div className={styles.snowflakes} aria-hidden="true">
          {"❄ ❅ ❆ ❄ ❅ ❆ ❄".split(" ").map((s, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.3}s` }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
