import Link from 'next/link';
import { ITEM_TYPES, SOURCE_CONFIDENCES } from '@/lib/taxonomy';
import type { Locale } from '@/i18n/config';
import styles from './QuickChips.module.css';

interface QuickChipsProps {
  locale: Locale;
}

export function QuickChips({ locale }: QuickChipsProps) {
  // Show first 4 types and first 2 confidence levels
  const typeChips = ITEM_TYPES.slice(0, 4);
  const confidenceChips = SOURCE_CONFIDENCES.slice(0, 2);

  return (
    <div className={styles.chips}>
      <div className={styles.group}>
        {typeChips.map(item => (
          <Link
            key={item.value}
            href={`/${locale}/catalog?type=${item.value}`}
            className={styles.chip}
          >
            {item.label[locale]}
          </Link>
        ))}
      </div>
      <div className={styles.group}>
        {confidenceChips.map(item => (
          <Link
            key={item.value}
            href={`/${locale}/catalog?confidence=${item.value}`}
            className={`${styles.chip} ${styles.secondary}`}
          >
            {item.label[locale]}
          </Link>
        ))}
      </div>
    </div>
  );
}
