"use client";

import { useState } from "react";
import styles from "./FAQ.module.scss";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  faqs: FAQItem[];
}

export default function FAQClient({ faqs }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Everything you need to know about shopping with Christmas24.
          </p>
          <div className={styles.divider} />
        </header>

        {faqs.length === 0 ? (
          <div className={styles.empty}>
            <span aria-hidden="true">🎄</span>
            <p>No FAQ items yet — check back soon!</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <li key={faq.id} className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
                  <button
                    className={styles.question}
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className={styles.icon} aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={styles.answerWrapper}
                    style={{ maxHeight: isOpen ? "600px" : "0" }}
                  >
                    <p className={styles.answer}>{faq.answer}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
