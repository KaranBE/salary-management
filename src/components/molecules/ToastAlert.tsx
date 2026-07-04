import styles from '@/app/page.module.css';
import { Info } from 'lucide-react';

interface ToastAlertProps {
  toast: { message: string; type: 'success' | 'error' } | null;
}

export function ToastAlert({ toast }: ToastAlertProps) {
  if (!toast) return null;

  return (
    <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
      <Info size={18} />
      <span>{toast.message}</span>
    </div>
  );
}
