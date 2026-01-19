import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/common';
import { HeroSection, ItemListCompact, FeaturedItem } from '@/components/home';
import { getNewestItems, getRecentItems, getFeaturedItems, featuredReasons } from '@/lib/mock/items';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('common');
  const typedLocale = locale as Locale;

  // Get mock data
  const newestItems = getNewestItems(5);
  const recentItems = getRecentItems(5);
  const featuredItems = getFeaturedItems(3);

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
              reason={featuredReasons[item.id]?.[typedLocale] || ''}
              locale={typedLocale}
            />
          ))}
        </div>
      </section>
    </Container>
  );
}
