"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackSearch } from "@/lib/gtm";
import styles from "./SearchPage.module.scss";

interface Props {
  initialQuery?: string;
}

export default function SearchInput({ initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    trackSearch(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm} role="search">
      <span className={styles.searchIcon} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        className={styles.searchField}
        type="search"
        name="q"
        placeholder="Search for gifts, decorations…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search products"
      />
      <button type="submit" className={styles.searchSubmit}>
        Search
      </button>
    </form>
  );
}
