import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/common';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { getCollectionBySlug, getAllCollections } from '@/lib/mock/collections';
import { getItemById } from '@/lib/mock/items';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function CollectionDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const collection = getCollectionBySlug(slug);
  if (!collection) {
    notFound();
  }

  const t = await getTranslations('collections');
  const typedLocale = locale as Locale;

  const title = collection.title[typedLocale] || collection.title.ja || collection.title.en;
  const description = collection.description[typedLocale] || collection.description.ja || collection.description.en;
  const curatorNote = collection.curatorNote?.[typedLocale] || collection.curatorNote?.ja || collection.curatorNote?.en;

  const items = collection.itemIds
    .map(id => getItemById(id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  return (
    <Container as="main" className={styles.main}>
      <Breadcrumb
        items={[
          { label: t('title'), href: `/${locale}/collections` },
          { label: title },
        ]}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </header>

      {curatorNote && (
        <section className={styles.curatorNote}>
          <h2 className={styles.sectionTitle}>{t('curatorNote')}</h2>
          <p>{curatorNote}</p>
        </section>
      )}

      <section className={styles.items}>
        <h2 className={styles.sectionTitle}>{t('items')} ({items.length})</h2>
        <ul className={styles.itemList}>
          {items.map(item => {
            const itemTitle = item.title[typedLocale] || item.title.ja || item.title.en;
            return (
              <li key={item.id} className={styles.itemRow}>
                <Link href={`/${locale}/items/${item.id}`} className={styles.itemLink}>
                  <span className={styles.itemId}>{item.id}</span>
                  <span className={styles.itemTitle}>{itemTitle}</span>
                  <span className={styles.itemType}>{item.type}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className={styles.backLink}>
        <Link href={`/${locale}/collections`}>
          &larr; {t('backToList')}
        </Link>
      </div>
    </Container>
  );
}

export async function generateStaticParams() {
  const collections = getAllCollections();
  const locales = ['ja', 'en'];

  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const collection of collections) {
      params.push({ locale, slug: collection.slug });
    }
  }

  return params;
}
