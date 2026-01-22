import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Container } from '@/components/common';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { TitleBlock, BodyViewer, SourceInfo, ItemSidebar } from '@/components/item';
import { getItemById } from '@/lib/firebase/firestore';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

// Dynamic rendering (no static generation with Firestore)
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ItemPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const item = await getItemById(id);
  if (!item) {
    notFound();
  }

  const t = await getTranslations('item');
  const typedLocale = locale as Locale;

  return (
    <Container as="main" className={styles.main}>
      <Breadcrumb
        items={[
          { label: t('catalog'), href: `/${locale}/catalog` },
          { label: item.id },
        ]}
      />

      <div className={styles.layout}>
        <article className={styles.content}>
          <TitleBlock item={item} locale={typedLocale} />
          <BodyViewer body={item.body} locale={typedLocale} />
          <SourceInfo item={item} locale={typedLocale} />
        </article>

        <aside className={styles.sidebar}>
          <ItemSidebar item={item} locale={typedLocale} />
        </aside>
      </div>
    </Container>
  );
}
