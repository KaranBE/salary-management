import { X } from 'lucide-react';
import styles from '@/app/page.module.css';
import { Button } from '../atoms/Button';
import type { Employee } from '@/lib/salary-management/types';

interface DeleteEmployeeModalProps {
  isOpen: boolean;
  deletingEmployee: Employee | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteEmployeeModal({
  isOpen,
  deletingEmployee,
  onClose,
  onConfirm,
}: DeleteEmployeeModalProps) {
  if (!isOpen || !deletingEmployee) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 style={{ color: 'var(--danger)' }}>Terminate Employee</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
            Are you sure you want to terminate the employment of <strong>{deletingEmployee.firstName} {deletingEmployee.lastName}</strong>?
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
            This will remove the employee record permanently from active payroll. This action cannot be undone.
          </p>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" type="button" onClick={onConfirm}>
            Confirm Termination
          </Button>
        </div>
      </div>
    </div>
  );
}
