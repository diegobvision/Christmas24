"use client";

import { useState } from "react";
import { shareContent } from "@/lib/gtm";
import styles from "./ShareButtons.module.scss";

interface Props {
  /** Absolute URL of the page being shared */
  url: string;
  /** Title / text used by social platforms */
  title: string;
  /** Whether this is a product page or a blog article */
  contentType: "product" | "article";
  /** Product or article handle — used as the GTM item_id */
  id: string;
  /** Optional image URL (used by Pinterest) */
  image?: string;
}

type ShareTarget = {
  method: string;
  label: string;
  href: string;
  icon: React.ReactNode;
};

export default function ShareButtons({ url, title, contentType, id, image }: Props) {
  const [copied, setCopied] = useState(false);

  const e = encodeURIComponent;

  const targets: ShareTarget[] = [
    {
      method: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </svg>
      ),
    },
    {
      method: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(title)}`,
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor">
          <path d="M18.9 1.6h3.3l-7.2 8.2L23.7 22h-6.6l-5.2-6.8L5.9 22H2.6l7.7-8.8L2 1.6h6.8l4.7 6.2 5.4-6.2Zm-1.2 18.4h1.8L7.4 3.5H5.5l12.2 16.5Z" />
        </svg>
      ),
    },
    {
      method: "pinterest",
      label: "Share on Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${e(url)}&description=${e(title)}${image ? `&media=${e(image)}` : ""}`,
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-3.6 19.33c-.05-.78-.1-1.98.02-2.83.11-.74.7-4.72.7-4.72s-.18-.36-.18-.9c0-.84.49-1.47 1.1-1.47.52 0 .77.39.77.86 0 .52-.33 1.3-.5 2.02-.15.6.3 1.1.9 1.1 1.08 0 1.9-1.14 1.9-2.78 0-1.45-1.04-2.47-2.53-2.47-1.72 0-2.73 1.29-2.73 2.62 0 .52.2 1.08.45 1.38a.18.18 0 0 1 .04.17c-.05.2-.15.6-.17.68-.03.11-.1.14-.22.08-.83-.38-1.34-1.58-1.34-2.55 0-2.07 1.5-3.97 4.34-3.97 2.28 0 4.05 1.62 4.05 3.79 0 2.27-1.43 4.09-3.41 4.09-.67 0-1.29-.35-1.5-.76l-.41 1.56c-.15.57-.55 1.29-.82 1.73A10 10 0 1 0 12 2Z" />
        </svg>
      ),
    },
    {
      method: "whatsapp",
      label: "Share on WhatsApp",
      href: `https://api.whatsapp.com/send?text=${e(`${title} ${url}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor">
          <path d="M.5 23.5l1.65-6A11.5 11.5 0 1 1 12 23.5a11.6 11.6 0 0 1-5.5-1.4L.5 23.5Zm6.3-3.7.36.22a9.6 9.6 0 1 0-3.2-3.18l.23.37-.98 3.56 3.59-.97Zm11.6-5.3c-.16-.27-.6-.43-1.25-.75s-1.49-.74-1.72-.82c-.23-.09-.4-.13-.56.13-.16.27-.65.82-.8.99-.14.16-.29.18-.55.06a7.8 7.8 0 0 1-2.3-1.42 8.6 8.6 0 0 1-1.59-1.98c-.16-.27-.02-.42.11-.55.12-.12.27-.31.4-.47.14-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.56-1.35-.77-1.85-.2-.49-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.32-.23.27-.86.85-.86 2.07s.89 2.4 1.01 2.57c.13.16 1.75 2.66 4.23 3.73.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.49-.61 1.7-1.2.21-.59.21-1.09.15-1.2Z" />
        </svg>
      ),
    },
    {
      method: "email",
      label: "Share by email",
      href: `mailto:?subject=${e(title)}&body=${e(`${title}\n\n${url}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 7 10 6 10-6" />
        </svg>
      ),
    },
  ];

  const handleShareClick = (method: string) => {
    shareContent({ method, contentType, itemId: id });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context) — silently ignore
    }
    shareContent({ method: "copy_link", contentType, itemId: id });
  };

  return (
    <div className={styles.share} data-gtm="share-bar" data-gtm-share-content-type={contentType}>
      <span className={styles.label}>Share</span>
      <ul className={styles.list}>
        {targets.map((t) => (
          <li key={t.method}>
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.button}
              aria-label={t.label}
              title={t.label}
              onClick={() => handleShareClick(t.method)}
              data-gtm="share"
              data-gtm-share-method={t.method}
              data-gtm-share-content-type={contentType}
              data-gtm-share-id={id}
            >
              {t.icon}
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={`${styles.button} ${copied ? styles.copied : ""}`}
            aria-label={copied ? "Link copied" : "Copy link"}
            title={copied ? "Link copied" : "Copy link"}
            onClick={handleCopy}
            data-gtm="share"
            data-gtm-share-method="copy_link"
            data-gtm-share-content-type={contentType}
            data-gtm-share-id={id}
          >
            {copied ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m20 6-11 11-5-5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </button>
        </li>
      </ul>
      {copied && (
        <span className={styles.copiedText} role="status">
          Link copied!
        </span>
      )}
    </div>
  );
}
