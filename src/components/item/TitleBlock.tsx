import type { ItemDoc } from '@/types/firestore';
import type { Locale } from '@/i18n/config';
import { Badge } from '@/components/common/Badge';
import styles from './TitleBlock.module.css';

interface TitleBlockProps {
  item: ItemDoc;
  locale: Locale;
}

export function TitleBlock({ item, locale }: TitleBlockProps) {
  const title = item.title[locale] || item.title.ja || item.title.en;

  return (
    <header className={styles.titleBlock}>
      <div className={styles.idLine}>
        <span className={styles.id}>{item.id}</span>
        <div className={styles.badges}>
          <Badge type="type" value={item.type} locale={locale} />
          <Badge type="language" value={item.language} locale={locale} />
          <Badge type="confidence" value={item.confidence} locale={locale} />
        </div>
      </div>

      <h1 className={styles.title}>{title}</h1>

      {item.originalTitle && (
        <p className={styles.originalTitle}>{item.originalTitle}</p>
      )}

      <div className={styles.meta}>
        {item.firstSeen && (
          <span className={styles.metaItem}>
            <strong>First seen:</strong> {item.firstSeen}
          </span>
        )}
        {item.sourceName && (
          <span className={styles.metaItem}>
            <strong>Source:</strong> {item.sourceName}
          </span>
        )}
      </div>
    </header>
  );
}
