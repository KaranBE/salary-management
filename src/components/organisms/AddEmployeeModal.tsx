import { X } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import styles from '@/app/page.module.css';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { FormGroup } from '../molecules/FormGroup';
import { COUNTRIES, DEPARTMENTS } from '@/lib/salary-management/constants';

export interface AddEmployeeFormState {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  addForm: AddEmployeeFormState;
  formError: string;
  setAddForm: Dispatch<SetStateAction<AddEmployeeFormState>>;
  onClose: () => void;
  onCountryChange: (countryName: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AddEmployeeModal({
  isOpen,
  addForm,
  formError,
  setAddForm,
  onClose,
  onCountryChange,
  onSubmit,
}: AddEmployeeModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Onboard New Employee</h3>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <FormGroup label="First Name *">
                <Input
                  type="text"
                  required
                  placeholder="Jane"
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, firstName: e.target.value }))}
                />
              </FormGroup>

              <FormGroup label="Last Name *">
                <Input
                  type="text"
                  required
                  placeholder="Doe"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, lastName: e.target.value }))}
                />
              </FormGroup>

              <FormGroup label="Corporate Email *" className={styles.formSpanFull}>
                <Input
                  type="email"
                  required
                  placeholder="jane.doe@acme.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </FormGroup>

              <FormGroup label="Gender *">
                <Select
                  value={addForm.gender}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </Select>
              </FormGroup>

              <FormGroup label="Job Title *">
                <Input
                  type="text"
                  required
                  placeholder="Lead Devops Engineer"
                  value={addForm.jobTitle}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
                />
              </FormGroup>

              <FormGroup label="Department *">
                <Select
                  value={addForm.department}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, department: e.target.value }))}
                >
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup label="Location *">
                <Select
                  value={addForm.country}
                  onChange={(e) => onCountryChange(e.target.value)}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup label="Local Currency">
                <Input
                  type="text"
                  readOnly
                  disabled
                  className={styles.textMuted}
                  value={addForm.currency}
                />
              </FormGroup>

              <FormGroup label="Annual Salary (Local Currency) *">
                <Input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 85000"
                  value={addForm.salary}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, salary: e.target.value }))}
                />
              </FormGroup>
            </div>
            {formError && <div className={styles.formError}>{formError}</div>}
          </div>
          <div className={styles.modalFooter}>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Onboard Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
