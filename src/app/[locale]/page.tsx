import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/common';
import { HeroSection, ItemListCompact, FeaturedItem } from '@/components/home';
import { getRecentItems, getRecentlyUpdatedItems, getFeaturedItems } from '@/lib/firebase/firestore';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

// Dynamic rendering for Firestore data
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('common');
  const typedLocale = locale as Locale;

  // Get data from Firestore
  const newestItems = await getRecentItems(5);
  const recentItems = await getRecentlyUpdatedItems(5);
  const featuredItems = await getFeaturedItems(3);

  return (
    <Container as="main" className={styles.main}>
      <HeroSection locale={typedLocale} />

      <div className={styles.columns}>
        <ItemListCompact
          title={t('newItems')}
          items={newestItems}
          locale={typedLocale}
        />
        <ItemListCompact
          title={t('recentlyUpdated')}
          items={recentItems}
          locale={typedLocale}
        />
      </div>

      <section className={styles.featured}>
        <h2 className={styles.featuredTitle}>{t('featured')}</h2>
        <div className={styles.featuredGrid}>
          {featuredItems.map(item => (
            <FeaturedItem
              key={item.id}
              item={item}
              reason=""
              locale={typedLocale}
            />
          ))}
        </div>
      </section>
    </Container>
  );
}
