import type { Metadata } from "next";
import { getArticles } from "@/lib/shopify";
import BlogClient from "./BlogClient";
import styles from "./BlogPage.module.scss";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://christmas24.co.uk";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Festive inspiration from Christmas24 — gift guides, decorating ideas and seasonal tips to make your Christmas magical.",
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    title: "Blog | Christmas24",
    description:
      "Festive inspiration from Christmas24 — gift guides, decorating ideas and seasonal tips to make your Christmas magical.",
  },
};

export default async function BlogPage() {
  const articles = await getArticles(20);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>From the Blog</h1>
        <p className={styles.intro}>
          Gift guides, decorating ideas and festive inspiration to help you
          make this Christmas the most magical yet.
        </p>
      </header>
      <BlogClient articles={articles} />
    </div>
  );
}
