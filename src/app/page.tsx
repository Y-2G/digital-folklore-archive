import { Container } from "@/components/common";
import styles from "./page.module.css";

export default function Home() {
  return (
    <Container as="main" className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>デジタル伝承資料庫</h1>
        <p className={styles.heroSubtitle}>
          怪談・都市伝説・チェーンメール等の収蔵・目録化プロジェクト
        </p>
      </div>

      <div className={styles.placeholder}>
        <p className={styles.status}>Phase 1.3: デザインシステム基盤 - 完了</p>
        <div className={styles.details}>
          <h2>実装済み</h2>
          <ul>
            <li>グローバルCSS変数システム</li>
            <li>レスポンシブブレークポイント定義</li>
            <li>Container コンポーネント</li>
            <li>Header コンポーネント</li>
            <li>Footer コンポーネント</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
