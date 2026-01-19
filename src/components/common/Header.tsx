'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { Container } from './Container';
import styles from './Header.module.css';

const navItems = [
  { href: '/catalog', key: 'catalog' },
  { href: '/collections', key: 'collections' },
  { href: '/about', key: 'about' },
] as const;

type HeaderProps = {
  locale: Locale;
};

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.content}>
          <div className={styles.siteName}>
            <Link href={`/${locale}`} className={styles.titleLink}>
              <h1 className={styles.title}>
                <span className={styles.titleJa}>デジタル伝承資料庫</span>
                <span className={styles.titleSep}>/</span>
                <span className={styles.titleEn}>Digital Folklore Archive</span>
              </h1>
            </Link>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className={styles.navLink}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.langToggle}>
              <LanguageSwitcher locale={locale} pathname={pathname} />
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}

function LanguageSwitcher({ locale, pathname }: { locale: Locale; pathname: string }) {
  const otherLocale = locale === 'ja' ? 'en' : 'ja';
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <Link href={switchedPath} className={styles.langLink}>
      {otherLocale.toUpperCase()}
    </Link>
  );
}
