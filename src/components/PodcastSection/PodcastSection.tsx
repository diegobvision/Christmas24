"use client";

import styles from "./PodcastSection.module.scss";

interface Props {
  spotifyShowId: string;
}

export default function PodcastSection({ spotifyShowId }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Festive Listening</h2>
        <p className={styles.intro}>
          Cosy up with our podcast — gift ideas, decorating tips and a sprinkle
          of Christmas cheer in every episode.
        </p>
        <div className={styles.embedWrapper}>
          <iframe
            className={styles.embed}
            src={`https://open.spotify.com/embed/show/${spotifyShowId}?utm_source=generator&theme=0`}
            title="Christmas24 podcast on Spotify"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
