import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { CollectionDoc } from '@/types/firestore';
import styles from './CollectionCard.module.css';

interface CollectionCardProps {
  collection: CollectionDoc;
  locale: Locale;
}

export function CollectionCard({ collection, locale }: CollectionCardProps) {
  const title = collection.title[locale] || collection.title.ja || collection.title.en;
  const description = collection.description?.[locale] || collection.description?.ja || collection.description?.en || '';

  return (
    <article className={styles.card}>
      <Link href={`/${locale}/collections/${collection.slug}`} className={styles.link}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.meta}>
          <span className={styles.count}>{collection.itemIds?.length || 0} items</span>
        </div>
      </Link>
    </article>
  );
}
