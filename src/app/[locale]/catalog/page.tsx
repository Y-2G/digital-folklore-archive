import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/common';
import { CatalogToolbar, FacetSidebar, CatalogTable } from '@/components/catalog';
import {
  queryCatalogItems,
  parseFiltersFromSearchParams,
  parseSortFromSearchParams,
} from '@/lib/catalog';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const typedLocale = locale as Locale;

  // Convert raw search params to URLSearchParams for parsing
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (Array.isArray(value)) {
      for (const v of value) urlParams.append(key, v);
    } else if (value) {
      urlParams.append(key, value);
    }
  }

  // Parse filters and sort from URL
  const filters = parseFiltersFromSearchParams(urlParams);
  const sort = parseSortFromSearchParams(urlParams);

  // Query items with filters and sorting
  const { items, total } = queryCatalogItems({
    filters,
    sort,
    limit: 50, // Show more items for now (no pagination yet)
  });

  return (
    <Container as="main" className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        {total > 0 && (
          <span className={styles.count}>{total} items</span>
        )}
      </header>

      <CatalogToolbar locale={typedLocale} searchParams={rawSearchParams} />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FacetSidebar locale={typedLocale} searchParams={rawSearchParams} />
        </aside>
        <section className={styles.content}>
          {items.length > 0 ? (
            <CatalogTable items={items} locale={typedLocale} />
          ) : (
            <p className={styles.noResults}>{t('noResults')}</p>
          )}
        </section>
      </div>
    </Container>
  );
}
