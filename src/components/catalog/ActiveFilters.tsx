'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getLabel, ITEM_TYPES, SOURCE_CONFIDENCES, LANGUAGES, FIRST_SEEN_PERIODS, MOTIFS } from '@/lib/taxonomy';
import type { Locale } from '@/i18n/config';
import styles from './ActiveFilters.module.css';

interface ActiveFiltersProps {
  searchParams: { [key: string]: string | string[] | undefined };
  locale: Locale;
}

const filterConfig = {
  type: ITEM_TYPES,
  confidence: SOURCE_CONFIDENCES,
  language: LANGUAGES,
  firstSeen: FIRST_SEEN_PERIODS,
  motif: MOTIFS,
} as const;

export function ActiveFilters({ searchParams, locale }: ActiveFiltersProps) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const filters: { param: string; value: string; label: string }[] = [];

  // Collect all active filters
  Object.entries(filterConfig).forEach(([param, items]) => {
    const values = getValues(searchParams[param]);
    values.forEach(value => {
      const label = getLabel(items as any, value as any, locale);
      filters.push({ param, value, label });
    });
  });

  // Add search query if present
  if (searchParams.q && typeof searchParams.q === 'string') {
    filters.push({ param: 'q', value: searchParams.q, label: `"${searchParams.q}"` });
  }

  if (filters.length === 0) {
    return null;
  }

  const removeFilter = (param: string, value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());

    if (param === 'q') {
      params.delete('q');
    } else {
      const current = params.getAll(param);
      params.delete(param);
      current.filter(v => v !== value).forEach(v => params.append(param, v));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className={styles.filters}>
      {filters.map((filter, i) => (
        <button
          key={`${filter.param}-${filter.value}-${i}`}
          className={styles.chip}
          onClick={() => removeFilter(filter.param, filter.value)}
          type="button"
        >
          {filter.label}
          <span className={styles.remove}>×</span>
        </button>
      ))}
      {filters.length > 1 && (
        <button className={styles.clearAll} onClick={clearAll} type="button">
          {t('clearAll')}
        </button>
      )}
    </div>
  );
}

function getValues(param: string | string[] | undefined): string[] {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}
