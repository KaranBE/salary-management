import styles from '@/app/page.module.css';
import { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: ReactNode;
  valueTitle?: string;
}

export function KpiCard({ title, value, subtext, icon, valueTitle }: KpiCardProps) {
  return (
    <div className={`${styles.kpiCard} ${styles.glassCard}`}>
      <div className={styles.kpiHeader}>
        <span className={styles.kpiTitle}>{title}</span>
        <div className={styles.kpiIcon}>{icon}</div>
      </div>
      <h2 className={styles.kpiValue} title={valueTitle}>
        {value}
      </h2>
      <span className={styles.kpiSubtext}>{subtext}</span>
    </div>
  );
}
