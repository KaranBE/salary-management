import { ChevronLeft, ChevronRight, Edit3, Search, Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import styles from '@/app/page.module.css';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { LoadingView } from '../molecules/LoadingView';
import { formatLocalSalary } from '@/lib/salary-management/formatters';
import type { Employee } from '@/lib/salary-management/types';

interface DirectoryViewProps {
  employees: Employee[];
  directoryLoading: boolean;
  searchQuery: string;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onSearchChange: Dispatch<SetStateAction<string>>;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function DirectoryView({
  employees,
  directoryLoading,
  searchQuery,
  totalCount,
  totalPages,
  currentPage,
  onSearchChange,
  onEditEmployee,
  onDeleteEmployee,
  onPreviousPage,
  onNextPage,
}: DirectoryViewProps) {
  return (
    <section className={`${styles.directoryCard} ${styles.glassCard}`}>
      <div className={styles.tableToolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search name, email, job title..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className={styles.paginationInfo}>
          Found <strong>{totalCount}</strong> employees
        </div>
      </div>

      {directoryLoading ? (
        <LoadingView />
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Salary Details (Local)</th>
                  <th>Last Assessment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No employees match current search criteria.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className={styles.empName}>
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className={styles.empEmail}>
                          {employee.jobTitle} • {employee.email}
                        </div>
                      </td>
                      <td>
                        <Badge variant="dept">{employee.department}</Badge>
                      </td>
                      <td>
                        <Badge variant="country">{employee.country}</Badge>
                      </td>
                      <td>
                        <div className={styles.salaryField}>
                          {formatLocalSalary(employee.salary, employee.currency)}
                        </div>
                        {employee.previousSalary && (
                          <div className={styles.previousSalary}>
                            Was {formatLocalSalary(employee.previousSalary, employee.currency)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {new Date(employee.salaryUpdatedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onEditEmployee(employee)}
                            title="Adjust Salary"
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDeleteEmployee(employee)}
                            title="Terminate Employee"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (showing {employees.length} of {totalCount} records)
              </div>
              <div className={styles.paginationButtons}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  disabled={currentPage === 1}
                  onClick={onPreviousPage}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                <button
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  disabled={currentPage === totalPages}
                  onClick={onNextPage}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
