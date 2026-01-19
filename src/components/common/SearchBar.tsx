'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  defaultValue?: string;
}

export function SearchBar({ placeholder = '', size = 'medium', defaultValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'ja';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/catalog?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/${locale}/catalog`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${styles[size]}`}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
      <button type="submit" className={styles.button} aria-label="Search">
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}
