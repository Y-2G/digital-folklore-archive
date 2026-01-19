import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/common';
import { ITEM_TYPES, getLabel } from '@/lib/taxonomy';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SubmitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('submit');
  const typedLocale = locale as Locale;

  return (
    <Container as="main" className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
      </header>

      <section className={styles.guidelines}>
        <h2 className={styles.guidelinesTitle}>{t('guidelines.title')}</h2>
        <p className={styles.guidelinesContent}>{t('guidelines.content')}</p>
      </section>

      <div className={styles.formWrapper}>
        <p className={styles.comingSoon}>{t('comingSoon')}</p>

        {/* Form preview (disabled) */}
        <form className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">{t('form.title')}</label>
            <input
              type="text"
              id="title"
              className={styles.input}
              placeholder={t('form.titlePlaceholder')}
              disabled
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="type">{t('form.type')}</label>
            <select id="type" className={styles.select} disabled>
              <option value="">{t('form.selectType')}</option>
              {ITEM_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {getLabel(ITEM_TYPES, type.value, typedLocale)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="body">{t('form.body')}</label>
            <textarea
              id="body"
              className={styles.textarea}
              placeholder={t('form.bodyPlaceholder')}
              rows={8}
              disabled
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="sourceName">{t('form.sourceName')}</label>
              <input
                type="text"
                id="sourceName"
                className={styles.input}
                placeholder={t('form.sourceNamePlaceholder')}
                disabled
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sourceUrl">{t('form.sourceUrl')}</label>
              <input
                type="url"
                id="sourceUrl"
                className={styles.input}
                placeholder={t('form.sourceUrlPlaceholder')}
                disabled
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="notes">{t('form.notes')}</label>
            <textarea
              id="notes"
              className={styles.textarea}
              placeholder={t('form.notesPlaceholder')}
              rows={3}
              disabled
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled>
            {t('form.submit')}
          </button>
        </form>
      </div>
    </Container>
  );
}
