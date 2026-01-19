import { getTranslations } from 'next-intl/server';
import type { ItemDoc } from '@/types/firestore';
import type { Locale } from '@/i18n/config';
import { getLabel, SOURCE_CONFIDENCES } from '@/lib/taxonomy';
import styles from './SourceInfo.module.css';

interface SourceInfoProps {
  item: ItemDoc;
  locale: Locale;
}

export async function SourceInfo({ item, locale }: SourceInfoProps) {
  const t = await getTranslations('item');

  const hasSourceInfo = item.sourceName || item.sourceUrl || item.sourceArchiveUrl;
  if (!hasSourceInfo) return null;

  return (
    <section className={styles.source}>
      <h2 className={styles.title}>{t('source')}</h2>

      <dl className={styles.list}>
        <dt>Confidence</dt>
        <dd>{getLabel(SOURCE_CONFIDENCES, item.confidence, locale)}</dd>

        {item.sourceName && (
          <>
            <dt>Source</dt>
            <dd>{item.sourceName}</dd>
          </>
        )}

        {item.sourceUrl && (
          <>
            <dt>URL</dt>
            <dd>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {item.sourceUrl}
              </a>
            </dd>
          </>
        )}

        {item.sourceArchiveUrl && (
          <>
            <dt>Archive</dt>
            <dd>
              <a
                href={item.sourceArchiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {item.sourceArchiveUrl}
              </a>
            </dd>
          </>
        )}
      </dl>
    </section>
  );
}
