import styles from '@/app/page.module.css';
import { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ children, className = '', ...props }: SelectProps) {
  return (
    <select className={`${styles.selectInput} ${className}`} {...props}>
      {children}
    </select>
  );
}
