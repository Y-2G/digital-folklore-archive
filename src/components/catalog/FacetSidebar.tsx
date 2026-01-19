'use client';

import { useTranslations } from 'next-intl';
import { FacetGroup } from './FacetGroup';
import { ITEM_TYPES, SOURCE_CONFIDENCES, LANGUAGES, FIRST_SEEN_PERIODS, MOTIFS } from '@/lib/taxonomy';
import type { Locale } from '@/i18n/config';
import styles from './FacetSidebar.module.css';

interface FacetSidebarProps {
  locale: Locale;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function FacetSidebar({ locale, searchParams }: FacetSidebarProps) {
  const t = useTranslations('catalog');

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>{t('filters')}</h2>

      <FacetGroup
        title={t('facets.type')}
        paramName="type"
        items={ITEM_TYPES}
        locale={locale}
        searchParams={searchParams}
      />

      <FacetGroup
        title={t('facets.confidence')}
        paramName="confidence"
        items={SOURCE_CONFIDENCES}
        locale={locale}
        searchParams={searchParams}
      />

      <FacetGroup
        title={t('facets.language')}
        paramName="language"
        items={LANGUAGES}
        locale={locale}
        searchParams={searchParams}
      />

      <FacetGroup
        title={t('facets.firstSeen')}
        paramName="firstSeen"
        items={FIRST_SEEN_PERIODS}
        locale={locale}
        searchParams={searchParams}
      />

      <FacetGroup
        title={t('facets.motif')}
        paramName="motif"
        items={MOTIFS}
        locale={locale}
        searchParams={searchParams}
        collapsed={true}
      />
    </div>
  );
}
