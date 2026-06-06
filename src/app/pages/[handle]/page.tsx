import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/lib/shopify";
import JsonLd from "@/components/JsonLd/JsonLd";
import styles from "./ShopifyPage.module.scss";

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://christmas24.co.uk";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) return { title: "Page not found" };

  const title = page.seo.title ?? page.title;
  const description = page.seo.description ?? page.bodySummary;
  const url = `${siteUrl}/pages/${handle}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}

export default async function ShopifyPageRoute({ params }: Props) {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) notFound();

  const url = `${siteUrl}/pages/${handle}`;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.bodySummary,
    url,
    dateModified: page.updatedAt,
    datePublished: page.createdAt,
    publisher: {
      "@type": "Organization",
      name: "Christmas24",
      url: siteUrl,
    },
  };

  return (
    <>
      <JsonLd data={webPageSchema} />
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>{page.title}</h1>
            <div className={styles.divider} />
          </header>
          <div
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        </div>
      </div>
    </>
  );
}
