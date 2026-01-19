'use client';

import { useTranslations } from 'next-intl';
import { SearchBar } from '@/components/common/SearchBar';
import { SortSelect } from './SortSelect';
import { ActiveFilters } from './ActiveFilters';
import type { Locale } from '@/i18n/config';
import styles from './CatalogToolbar.module.css';

interface CatalogToolbarProps {
  locale: Locale;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function CatalogToolbar({ locale, searchParams }: CatalogToolbarProps) {
  const t = useTranslations('catalog');
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';

  return (
    <div className={styles.toolbar}>
      <div className={styles.searchRow}>
        <SearchBar
          placeholder={t('searchPlaceholder')}
          size="medium"
          defaultValue={query}
        />
        <SortSelect />
      </div>
      <ActiveFilters searchParams={searchParams} locale={locale} />
    </div>
  );
}
