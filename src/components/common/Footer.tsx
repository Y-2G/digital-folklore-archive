'use client';

import { useTranslations } from 'next-intl';
import { Container } from './Container';
import styles from './Footer.module.css';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.content}>
          <p className={styles.copyright}>
            &copy; {currentYear} {t('copyright')}
          </p>
          <p className={styles.description}>
            {t('description')}
          </p>
        </div>
      </Container>
    </footer>
  );
}
