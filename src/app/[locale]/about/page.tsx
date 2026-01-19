import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/common';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');

  return (
    <Container as="main" className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('mission.title')}</h2>
          <p className={styles.sectionContent}>{t('mission.content')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('methodology.title')}</h2>
          <p className={styles.sectionContent}>{t('methodology.content')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('contribution.title')}</h2>
          <p className={styles.sectionContent}>{t('contribution.content')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('contact.title')}</h2>
          <p className={styles.sectionContent}>{t('contact.content')}</p>
        </section>
      </div>
    </Container>
  );
}
