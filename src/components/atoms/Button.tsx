import styles from '@/app/page.module.css';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  iconOnly?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const btnClass = [
    styles.btn,
    variant === 'primary' ? styles.btnPrimary : variant === 'danger' ? styles.btnDanger : styles.btnSecondary,
    size === 'sm' ? styles.btnSm : '',
    iconOnly ? styles.btnIconOnly : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}
