import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Container } from '@/components/common';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { TitleBlock, BodyViewer, SourceInfo, ItemSidebar } from '@/components/item';
import { getItemById } from '@/lib/mock/items';
import type { Locale } from '@/i18n/config';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ItemPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const item = getItemById(id);
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

export async function generateStaticParams() {
  // Generate params for all mock items
  const { getAllItems } = await import('@/lib/mock/items');
  const items = getAllItems();

  const params: { locale: string; id: string }[] = [];
  const locales = ['ja', 'en'];

  for (const locale of locales) {
    for (const item of items) {
      params.push({ locale, id: item.id });
    }
  }

  return params;
}
