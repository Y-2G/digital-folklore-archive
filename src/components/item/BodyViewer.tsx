'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import styles from './BodyViewer.module.css';

interface BilingualText {
  ja?: string;
  en?: string;
  original?: string;
}

interface BodyViewerProps {
  body: BilingualText;
  locale: Locale;
}

type ViewMode = 'original' | 'translation';

export function BodyViewer({ body, locale }: BodyViewerProps) {
  const t = useTranslations('item');
  const hasOriginal = !!body.original;
  const hasTranslation = !!(body.ja || body.en);

  const [mode, setMode] = useState<ViewMode>(
    hasOriginal ? 'original' : 'translation'
  );

  const getContent = () => {
    if (mode === 'original' && body.original) {
      return body.original;
    }
    return body[locale] || body.ja || body.en || '';
  };

  const content = getContent();

  return (
    <section className={styles.bodyViewer}>
      {hasOriginal && hasTranslation && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'original' ? styles.active : ''}`}
            onClick={() => setMode('original')}
            type="button"
          >
            {t('originalText')}
          </button>
          <button
            className={`${styles.tab} ${mode === 'translation' ? styles.active : ''}`}
            onClick={() => setMode('translation')}
            type="button"
          >
            {t('translation')}
          </button>
        </div>
      )}

      <div className={styles.content}>
        {content.split('\n').map((paragraph, i) => (
          paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
        ))}
      </div>
    </section>
  );
}
