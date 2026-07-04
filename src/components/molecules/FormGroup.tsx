import styles from '@/app/page.module.css';
import { ReactNode } from 'react';

interface FormGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FormGroup({ label, children, className = '' }: FormGroupProps) {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}
