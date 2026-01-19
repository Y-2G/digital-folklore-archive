import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/common';
import { getAllItems } from '@/lib/mock/items';
import { ITEM_TYPES, LANGUAGES, REGIONS, MEDIUMS, getLabel } from '@/lib/taxonomy';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AnalysisPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('analysis');
  const typedLocale = locale as Locale;
  const items = getAllItems();

  // Calculate distributions
  const typeDistribution = ITEM_TYPES.map(type => ({
    label: getLabel(ITEM_TYPES, type.value, typedLocale),
    count: items.filter(item => item.type === type.value).length,
  })).filter(d => d.count > 0);

  const languageDistribution = LANGUAGES.map(lang => ({
    label: getLabel(LANGUAGES, lang.value, typedLocale),
    count: items.filter(item => item.language === lang.value).length,
  })).filter(d => d.count > 0);

  const regionDistribution = REGIONS.map(region => ({
    label: getLabel(REGIONS, region.value, typedLocale),
    count: items.filter(item => item.region === region.value).length,
  })).filter(d => d.count > 0);

  const mediumDistribution = MEDIUMS.map(medium => ({
    label: getLabel(MEDIUMS, medium.value, typedLocale),
    count: items.filter(item => item.medium === medium.value).length,
  })).filter(d => d.count > 0);

  return (
    <Container as="main" className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
      </header>

      <div className={styles.stats}>
        <div className={styles.totalCard}>
          <span className={styles.totalLabel}>{t('totalItems')}</span>
          <span className={styles.totalValue}>{items.length}</span>
        </div>
      </div>

      <div className={styles.distributions}>
        <section className={styles.distributionSection}>
          <h2 className={styles.sectionTitle}>{t('byType')}</h2>
          <DistributionList items={typeDistribution} total={items.length} />
        </section>

        <section className={styles.distributionSection}>
          <h2 className={styles.sectionTitle}>{t('byLanguage')}</h2>
          <DistributionList items={languageDistribution} total={items.length} />
        </section>

        <section className={styles.distributionSection}>
          <h2 className={styles.sectionTitle}>{t('byRegion')}</h2>
          <DistributionList items={regionDistribution} total={items.length} />
        </section>

        <section className={styles.distributionSection}>
          <h2 className={styles.sectionTitle}>{t('byMedium')}</h2>
          <DistributionList items={mediumDistribution} total={items.length} />
        </section>
      </div>

      <p className={styles.comingSoon}>{t('comingSoon')}</p>
    </Container>
  );
}

interface DistributionItem {
  label: string;
  count: number;
}

function DistributionList({ items, total }: { items: DistributionItem[]; total: number }) {
  return (
    <ul className={styles.distributionList}>
      {items.map(item => (
        <li key={item.label} className={styles.distributionItem}>
          <span className={styles.distributionLabel}>{item.label}</span>
          <div className={styles.distributionBar}>
            <div
              className={styles.distributionFill}
              style={{ width: `${(item.count / total) * 100}%` }}
            />
          </div>
          <span className={styles.distributionCount}>{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
