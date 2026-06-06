import type { Metadata } from "next";
import { getMetaobjects, metafield } from "@/lib/shopify";
import JsonLd from "@/components/JsonLd/JsonLd";
import FAQClient from "./FAQClient";

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://christmas24.co.uk";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Find answers to common questions about orders, delivery, returns, and gift wrapping at Christmas24.",
  alternates: { canonical: `${siteUrl}/faq` },
};

export default async function FAQPage() {
  const metaobjects = await getMetaobjects("faq_item").catch(() => []);

  const faqs = metaobjects.map((obj) => ({
    id: obj.id,
    question: metafield(obj, "question"),
    answer: metafield(obj, "answer"),
  })).filter((f) => f.question && f.answer);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <FAQClient faqs={faqs} />
    </>
  );
}
