import styles from "./TagPill.module.scss";

interface Props {
  tag: string;
}

export default function TagPill({ tag }: Props) {
  return <span className={styles.pill}>{tag}</span>;
}
