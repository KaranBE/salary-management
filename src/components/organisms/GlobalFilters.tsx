import { COUNTRIES, DEPARTMENTS } from '@/lib/salary-management/constants';
import styles from '@/app/page.module.css';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';

interface GlobalFiltersProps {
  filterCountry: string;
  filterDept: string;
  onCountryChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onReset: () => void;
}

export function GlobalFilters({
  filterCountry,
  filterDept,
  onCountryChange,
  onDepartmentChange,
  onReset,
}: GlobalFiltersProps) {
  return (
    <section className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <label>Country</label>
        <Select
          value={filterCountry}
          onChange={(e) => onCountryChange(e.target.value)}
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((country) => (
            <option key={country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.filterGroup}>
        <label>Department</label>
        <Select
          value={filterDept}
          onChange={(e) => onDepartmentChange(e.target.value)}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </Select>
      </div>

      {(filterCountry || filterDept) && (
        <Button className={styles.clearButton} onClick={onReset}>
          Reset Filters
        </Button>
      )}
    </section>
  );
}
