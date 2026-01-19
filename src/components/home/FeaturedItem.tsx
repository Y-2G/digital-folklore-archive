import Link from 'next/link';
import type { ItemDoc } from '@/types/firestore';
import type { Locale } from '@/i18n/config';
import styles from './FeaturedItem.module.css';

interface FeaturedItemProps {
  item: ItemDoc;
  reason: string;
  locale: Locale;
}

export function FeaturedItem({ item, reason, locale }: FeaturedItemProps) {
  const title = item.title[locale] || item.title.ja || item.title.en || 'Untitled';

  return (
    <article className={styles.card}>
      <Link href={`/${locale}/items/${item.id}`} className={styles.link}>
        <span className={styles.id}>{item.id}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.reason}>{reason}</p>
      </Link>
    </article>
  );
}
