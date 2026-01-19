import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/common';
import { CollectionCard } from '@/components/collection';
import { getAllCollections } from '@/lib/mock/collections';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CollectionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('collections');
  const collections = getAllCollections();
  const typedLocale = locale as Locale;

  return (
    <Container as="main" className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
      </header>

      <div className={styles.grid}>
        {collections.map(collection => (
          <CollectionCard
            key={collection.slug}
            collection={collection}
            locale={typedLocale}
          />
        ))}
      </div>
    </Container>
  );
}
