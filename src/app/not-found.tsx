import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">🎄</div>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.message}>
          Looks like this page has wandered off into the snow.
        </p>
        <Link href="/" className={styles.homeLink}>
          ← Back to the workshop
        </Link>
      </div>
    </div>
  );
}
