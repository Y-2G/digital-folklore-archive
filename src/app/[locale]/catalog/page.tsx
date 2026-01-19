import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/common';
import { CatalogToolbar, FacetSidebar, CatalogTable } from '@/components/catalog';
import { getAllItems } from '@/lib/mock/items';
import type { Locale } from '@/i18n/config';
import type { ItemDoc } from '@/types/firestore';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const search = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const typedLocale = locale as Locale;

  // Get and filter items
  let items = getAllItems();
  items = filterItems(items, search);
  items = sortItems(items, search.sort as string);

  return (
    <Container as="main" className={styles.main}>
      <h1 className={styles.title}>{t('title')}</h1>

      <CatalogToolbar locale={typedLocale} searchParams={search} />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FacetSidebar locale={typedLocale} searchParams={search} />
        </aside>
        <section className={styles.content}>
          <CatalogTable items={items} locale={typedLocale} />
        </section>
      </div>
    </Container>
  );
}

function filterItems(
  items: ItemDoc[],
  params: { [key: string]: string | string[] | undefined }
): ItemDoc[] {
  let filtered = [...items];

  // Filter by type
  const types = getValues(params.type);
  if (types.length > 0) {
    filtered = filtered.filter(item => types.includes(item.type));
  }

  // Filter by confidence
  const confidences = getValues(params.confidence);
  if (confidences.length > 0) {
    filtered = filtered.filter(item => confidences.includes(item.confidence));
  }

  // Filter by language
  const languages = getValues(params.language);
  if (languages.length > 0) {
    filtered = filtered.filter(item => languages.includes(item.language));
  }

  // Filter by firstSeen
  const firstSeens = getValues(params.firstSeen);
  if (firstSeens.length > 0) {
    filtered = filtered.filter(item => item.firstSeen && firstSeens.includes(item.firstSeen));
  }

  // Filter by motif
  const motifs = getValues(params.motif);
  if (motifs.length > 0) {
    filtered = filtered.filter(item =>
      item.motifs?.some(m => motifs.includes(m))
    );
  }

  // Filter by search query
  if (params.q && typeof params.q === 'string') {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(item => {
      const searchText = [
        item.id,
        item.title.ja,
        item.title.en,
        item.originalTitle,
        item.sourceName,
        ...(item.searchTokens || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchText.includes(query);
    });
  }

  return filtered;
}

function sortItems(items: ItemDoc[], sort?: string): ItemDoc[] {
  const sorted = [...items];

  switch (sort) {
    case 'updated':
      return sorted.sort(
        (a, b) => b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime()
      );
    case 'firstSeen':
      return sorted.sort((a, b) => {
        const order = ['Pre-1999', '2000s', '2010s', '2020s', 'Unknown'];
        return order.indexOf(a.firstSeen || 'Unknown') - order.indexOf(b.firstSeen || 'Unknown');
      });
    case 'mostAnnotated':
      return sorted.sort(
        (a, b) => (b.annotationCount || 0) - (a.annotationCount || 0)
      );
    case 'new':
    default:
      return sorted.sort(
        (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );
  }
}

function getValues(param: string | string[] | undefined): string[] {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}
