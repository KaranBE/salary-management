import styles from '@/app/page.module.css';
import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'dept' | 'country';
  children: ReactNode;
}

export function Badge({ variant = 'dept', children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${variant === 'dept' ? styles.badgeDept : styles.badgeCountry}`}>
      {children}
    </span>
  );
}
