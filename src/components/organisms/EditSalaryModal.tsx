import { X } from 'lucide-react';
import type { FormEvent } from 'react';
import styles from '@/app/page.module.css';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { FormGroup } from '../molecules/FormGroup';
import { formatLocalSalary } from '@/lib/salary-management/formatters';
import type { Employee } from '@/lib/salary-management/types';

interface EditSalaryModalProps {
  isOpen: boolean;
  editingEmployee: Employee | null;
  editSalaryVal: string;
  editError: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onSalaryChange: (value: string) => void;
}

export function EditSalaryModal({
  isOpen,
  editingEmployee,
  editSalaryVal,
  editError,
  onClose,
  onSubmit,
  onSalaryChange,
}: EditSalaryModalProps) {
  if (!isOpen || !editingEmployee) return null;

  const currentSalary = editingEmployee.salary;
  const proposedSalary = parseFloat(editSalaryVal) || 0;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Adjust Employee Salary</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.modalTextSpacing}>
              Adjust compensation for <strong>{editingEmployee.firstName} {editingEmployee.lastName}</strong> ({editingEmployee.jobTitle}).
            </div>

            <div className={styles.comparisonBox}>
              <div className={styles.compVal}>
                <label>Current Salary</label>
                <span>{formatLocalSalary(currentSalary, editingEmployee.currency)}</span>
              </div>
              <span className={styles.compArrow}>→</span>
              <div className={styles.compVal}>
                <label>Proposed Salary</label>
                <span>{formatLocalSalary(proposedSalary, editingEmployee.currency)}</span>
              </div>
              <div className={styles.compVal}>
                <label>Change %</label>
                <span
                  className={
                    proposedSalary >= currentSalary
                      ? styles.compValDelta
                      : styles.formError
                  }
                >
                  {currentSalary > 0 && proposedSalary
                    ? `${(((proposedSalary - currentSalary) / currentSalary) * 100).toFixed(1)}%`
                    : '0.0%'}
                </span>
              </div>
            </div>

            <FormGroup label={`New Annual Salary (${editingEmployee.currency}) *`}>
              <Input
                type="number"
                required
                min="0"
                value={editSalaryVal}
                onChange={(e) => onSalaryChange(e.target.value)}
                placeholder="Enter new compensation..."
              />
            </FormGroup>

            {editError && <div className={styles.formError}>{editError}</div>}
          </div>
          <div className={styles.modalFooter}>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Apply Adjustment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
