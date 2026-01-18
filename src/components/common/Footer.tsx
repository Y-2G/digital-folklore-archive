import { Container } from './Container';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.content}>
          <p className={styles.copyright}>
            &copy; {currentYear} Digital Folklore Archive
          </p>
          <p className={styles.description}>
            デジタル伝承資料庫 - 怪談・都市伝説・チェーンメール等の収蔵・目録化プロジェクト
          </p>
        </div>
      </Container>
    </footer>
  );
}
