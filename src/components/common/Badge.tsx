import { getLabel, ITEM_TYPES, SOURCE_CONFIDENCES, LANGUAGES } from '@/lib/taxonomy';
import type { ItemType, SourceConfidence, Language } from '@/types/firestore';
import type { Locale } from '@/i18n/config';
import styles from './Badge.module.css';

type BadgeType = 'type' | 'language' | 'confidence';

interface BadgeProps {
  type: BadgeType;
  value: ItemType | Language | SourceConfidence;
  locale: Locale;
}

export function Badge({ type, value, locale }: BadgeProps) {
  const label = getBadgeLabel(type, value, locale);

  return (
    <span className={`${styles.badge} ${styles[type]}`} data-value={value.toLowerCase()}>
      {label}
    </span>
  );
}

function getBadgeLabel(type: BadgeType, value: string, locale: Locale): string {
  switch (type) {
    case 'type':
      return getLabel(ITEM_TYPES, value as ItemType, locale);
    case 'language':
      return getLabel(LANGUAGES, value as Language, locale);
    case 'confidence':
      return getLabel(SOURCE_CONFIDENCES, value as SourceConfidence, locale);
    default:
      return value;
  }
}
