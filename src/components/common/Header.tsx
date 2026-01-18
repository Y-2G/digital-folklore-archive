import { Container } from './Container';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.content}>
          <div className={styles.siteName}>
            <h1 className={styles.title}>
              <span className={styles.titleJa}>デジタル伝承資料庫</span>
              <span className={styles.titleSep}>/</span>
              <span className={styles.titleEn}>Digital Folklore Archive</span>
            </h1>
          </div>

          <nav className={styles.nav}>
            {/* Navigation placeholder - will be implemented in Phase 3 */}
            <div className={styles.navPlaceholder}>
              {/* Future: Catalog, Collections, About, etc. */}
            </div>

            {/* Language toggle placeholder */}
            <div className={styles.langToggle}>
              {/* Future: JA / EN toggle */}
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}
