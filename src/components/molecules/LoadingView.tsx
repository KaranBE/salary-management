import styles from '@/app/page.module.css';
import { Spinner } from '../atoms/Spinner';
import { ReactNode } from 'react';

interface LoadingViewProps {
  children?: ReactNode;
}

export function LoadingView({ children }: LoadingViewProps) {
  return (
    <div className={styles.loadingContainer}>
      <Spinner />
      {children}
    </div>
  );
}
