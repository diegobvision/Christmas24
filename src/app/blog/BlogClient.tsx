"use client";

import { useMemo, useState } from "react";
import { ShopifyArticle } from "@/lib/shopify";
import BlogCard from "@/components/BlogCard/BlogCard";
import styles from "./BlogPage.module.scss";

interface Props {
  articles: ShopifyArticle[];
}

export default function BlogClient({ articles }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(
    () =>
      [...new Set(articles.flatMap((a) => a.tags))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [articles]
  );

  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <div className={styles.body}>
      {tags.length > 0 && (
        <div className={styles.tagFilter} role="group" aria-label="Filter articles by tag">
          <button
            className={`${styles.tagBtn} ${!activeTag ? styles.tagActive : ""}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`${styles.tagBtn} ${activeTag === tag ? styles.tagActive : ""}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span aria-hidden="true">📖</span>
          <p>No articles yet — check back soon for festive inspiration.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
