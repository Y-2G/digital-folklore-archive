'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { TaxonomyItem } from '@/lib/taxonomy';
import type { Locale } from '@/i18n/config';
import styles from './FacetGroup.module.css';

interface FacetGroupProps<T extends string> {
  title: string;
  paramName: string;
  items: TaxonomyItem<T>[];
  locale: Locale;
  searchParams: { [key: string]: string | string[] | undefined };
  collapsed?: boolean;
}

export function FacetGroup<T extends string>({
  title,
  paramName,
  items,
  locale,
  searchParams,
  collapsed = false,
}: FacetGroupProps<T>) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const selectedValues = getSelectedValues(searchParams[paramName]);

  const toggleValue = (value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    const current = params.getAll(paramName);

    if (current.includes(value)) {
      params.delete(paramName);
      current.filter(v => v !== value).forEach(v => params.append(paramName, v));
    } else {
      params.append(paramName, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.group}>
      <button
        className={styles.header}
        onClick={() => setIsCollapsed(!isCollapsed)}
        type="button"
      >
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.toggle}>{isCollapsed ? '+' : '−'}</span>
      </button>
      {!isCollapsed && (
        <ul className={styles.list}>
          {items.map(item => (
            <li key={item.value} className={styles.item}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={selectedValues.includes(item.value)}
                  onChange={() => toggleValue(item.value)}
                  className={styles.checkbox}
                />
                <span className={styles.text}>{item.label[locale]}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getSelectedValues(param: string | string[] | undefined): string[] {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}
