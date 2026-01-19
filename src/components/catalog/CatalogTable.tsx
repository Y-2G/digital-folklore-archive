import { getTranslations } from 'next-intl/server';
import type { ItemDoc } from '@/types/firestore';
import type { Locale } from '@/i18n/config';
import { CatalogRow } from './CatalogRow';
import styles from './CatalogTable.module.css';

interface CatalogTableProps {
  items: ItemDoc[];
  locale: Locale;
}

export async function CatalogTable({ items, locale }: CatalogTableProps) {
  const t = await getTranslations('catalog.columns');

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No items found.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.colId}>{t('id')}</th>
            <th className={styles.colTitle}>{t('title')}</th>
            <th className={styles.colType}>{t('type')}</th>
            <th className={styles.colFirstSeen}>{t('firstSeen')}</th>
            <th className={styles.colSource}>{t('source')}</th>
            <th className={styles.colUpdated}>{t('updated')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <CatalogRow key={item.id} item={item} locale={locale} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
