import Link from 'next/link';
import type { ItemDoc } from '@/types/firestore';
import type { Locale } from '@/i18n/config';
import { getLabel, ITEM_TYPES } from '@/lib/taxonomy';
import styles from './ItemListCompact.module.css';

interface ItemListCompactProps {
  title: string;
  items: ItemDoc[];
  locale: Locale;
}

export function ItemListCompact({ title, items, locale }: ItemListCompactProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.id} className={styles.item}>
            <Link href={`/${locale}/items/${item.id}`} className={styles.link}>
              <span className={styles.id}>{item.id}</span>
              <span className={styles.itemTitle}>
                {item.title[locale] || item.title.ja || item.title.en}
              </span>
              <span className={styles.type}>
                {getLabel(ITEM_TYPES, item.type, locale)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
