import { getTranslations } from 'next-intl/server';
import type { ItemDoc } from '@/types/firestore';
import type { Locale } from '@/i18n/config';
import { getLabel, MOTIFS, REGIONS, MEDIUMS } from '@/lib/taxonomy';
import styles from './ItemSidebar.module.css';

interface ItemSidebarProps {
  item: ItemDoc;
  locale: Locale;
}

export async function ItemSidebar({ item, locale }: ItemSidebarProps) {
  const t = await getTranslations('item');

  const hasMotifs = item.motifs && item.motifs.length > 0;
  const hasRegion = !!item.region;
  const hasMedium = !!item.medium;

  if (!hasMotifs && !hasRegion && !hasMedium) return null;

  return (
    <div className={styles.sidebar}>
      <section className={styles.section}>
        <h3 className={styles.heading}>{t('metadata')}</h3>
        <dl className={styles.meta}>
          {hasMotifs && (
            <>
              <dt>Motifs</dt>
              <dd>
                <ul className={styles.tagList}>
                  {item.motifs.map(m => (
                    <li key={m} className={styles.tag}>
                      {getLabel(MOTIFS, m, locale)}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {hasRegion && (
            <>
              <dt>Region</dt>
              <dd>{getLabel(REGIONS, item.region!, locale)}</dd>
            </>
          )}

          {hasMedium && (
            <>
              <dt>Medium</dt>
              <dd>{getLabel(MEDIUMS, item.medium!, locale)}</dd>
            </>
          )}
        </dl>
      </section>
    </div>
  );
}
