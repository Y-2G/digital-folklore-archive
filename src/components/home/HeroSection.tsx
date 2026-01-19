import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { SearchBar } from '@/components/common/SearchBar';
import { QuickChips } from './QuickChips';
import type { Locale } from '@/i18n/config';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  locale: Locale;
}

export async function HeroSection({ locale }: HeroSectionProps) {
  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');

  return (
    <section className={styles.hero}>
      <h1 className={styles.tagline}>{t('tagline')}</h1>

      <div className={styles.searchWrapper}>
        <SearchBar placeholder={t('searchPlaceholder')} size="large" />
      </div>

      <QuickChips locale={locale} />

      <Link href={`/${locale}/catalog`} className={styles.cta}>
        {tCommon('viewCatalog')} →
      </Link>
    </section>
  );
}
