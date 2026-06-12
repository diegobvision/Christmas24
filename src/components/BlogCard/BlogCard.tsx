import Link from "next/link";
import Image from "next/image";
import { ShopifyArticle } from "@/lib/shopify";
import TagPill from "./TagPill";
import styles from "./BlogCard.module.scss";

interface Props {
  article: ShopifyArticle;
}

export function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogCard({ article }: Props) {
  return (
    <Link href={`/blog/${article.handle}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {article.image ? (
          <Image
            src={article.image.url}
            alt={article.image.altText ?? article.title}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            <span aria-hidden="true">🎄</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        {article.tags.length > 0 && (
          <div className={styles.tags}>
            {article.tags.slice(0, 2).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        )}
        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.meta}>
          {article.author?.name && (
            <span className={styles.author}>By {article.author.name}</span>
          )}
          <time dateTime={article.publishedAt}>
            {formatArticleDate(article.publishedAt)}
          </time>
        </p>
        {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
      </div>
    </Link>
  );
}
