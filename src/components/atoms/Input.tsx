import styles from '@/app/page.module.css';
import { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${styles.formInput} ${className}`} {...props} />;
}
