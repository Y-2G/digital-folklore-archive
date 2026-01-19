import Link from 'next/link';
import type { ItemDoc } from '@/types/firestore';
import type { Locale } from '@/i18n/config';
import { Badge } from '@/components/common/Badge';
import styles from './CatalogRow.module.css';

interface CatalogRowProps {
  item: ItemDoc;
  locale: Locale;
}

export function CatalogRow({ item, locale }: CatalogRowProps) {
  const title = item.title[locale] || item.title.ja || item.title.en || 'Untitled';
  const updatedDate = item.updatedAt?.toDate?.()
    ? item.updatedAt.toDate().toISOString().split('T')[0]
    : '—';

  return (
    <tr className={styles.row}>
      <td className={styles.id}>
        <Link href={`/${locale}/items/${item.id}`} className={styles.idLink}>
          {item.id}
        </Link>
      </td>
      <td className={styles.title}>
        <Link href={`/${locale}/items/${item.id}`} className={styles.titleLink}>
          {title}
          {item.originalTitle && (
            <span className={styles.originalTitle}>({item.originalTitle})</span>
          )}
        </Link>
        <div className={styles.badges}>
          <Badge type="type" value={item.type} locale={locale} />
          <Badge type="language" value={item.language} locale={locale} />
          <Badge type="confidence" value={item.confidence} locale={locale} />
        </div>
      </td>
      <td className={styles.type}>
        <Badge type="type" value={item.type} locale={locale} />
      </td>
      <td className={styles.firstSeen}>{item.firstSeen || '—'}</td>
      <td className={styles.source}>{item.sourceName || '—'}</td>
      <td className={styles.updated}>{updatedDate}</td>
    </tr>
  );
}
