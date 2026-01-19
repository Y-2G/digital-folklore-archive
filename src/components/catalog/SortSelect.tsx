'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './SortSelect.module.css';

const sortOptions = ['new', 'updated', 'firstSeen', 'mostAnnotated'] as const;

export function SortSelect() {
  const t = useTranslations('catalog.sort');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'new';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select value={currentSort} onChange={handleChange} className={styles.select}>
      {sortOptions.map(option => (
        <option key={option} value={option}>
          {t(option)}
        </option>
      ))}
    </select>
  );
}
