import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import {
  getArticles,
  getArticleByHandle,
  getBlogHandles,
  ShopifyArticle,
} from "@/lib/shopify";
import TagPill from "@/components/BlogCard/TagPill";
import { formatArticleDate } from "@/components/BlogCard/BlogCard";
import styles from "./ArticlePage.module.scss";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://christmas24.co.uk";

interface Props {
  params: Promise<{ handle: string }>;
}

// Article handles are unique within a blog, so resolve the owning blog
// internally rather than exposing it in the URL.
async function resolveArticle(handle: string): Promise<ShopifyArticle | null> {
  const blogHandles = await getBlogHandles();
  for (const blogHandle of blogHandles) {
    const article = await getArticleByHandle(blogHandle, handle);
    if (article) return article;
  }
  return null;
}

export async function generateStaticParams() {
  try {
    const articles = await getArticles(250);
    return articles.map((article) => ({ handle: article.handle }));
  } catch (e) {
    console.error("Blog: failed to fetch articles for static params", e);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const article = await resolveArticle(handle);
  if (!article) return { title: "Article not found" };

  const url = `${siteUrl}/blog/${handle}`;
  const description = article.excerpt?.slice(0, 160);

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${article.title} | Christmas24`,
      description,
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: article.image ? [{ url: article.image.url, alt: article.title }] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { handle } = await params;
  const article = await resolveArticle(handle);
  if (!article) notFound();

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.meta}>
          {article.author?.name && (
            <span className={styles.author}>By {article.author.name}</span>
          )}
          <time dateTime={article.publishedAt}>
            {formatArticleDate(article.publishedAt)}
          </time>
        </p>
        {article.tags.length > 0 && (
          <div className={styles.tags}>
            {article.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        )}
      </header>

      {article.image && (
        <div className={styles.imageWrapper}>
          <Image
            src={article.image.url}
            alt={article.image.altText ?? article.title}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className={styles.image}
          />
        </div>
      )}

      <div
        className={styles.prose}
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />
    </article>
  );
}
