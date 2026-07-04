'use client';

import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit3,
  Globe,
  Info,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COUNTRIES, DEPARTMENTS } from '@/lib/salary-management/constants';
import {
  formatCompact,
  formatLocalSalary,
  formatUSD,
} from '@/lib/salary-management/formatters';
import type { DashboardData, Employee } from '@/lib/salary-management/types';
import styles from './page.module.css';

type ActiveTab = 'dashboard' | 'directory';

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

interface LoadingViewProps {
  children?: ReactNode;
}

function LoadingView({ children }: LoadingViewProps) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      {children}
    </div>
  );
}

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

interface SidebarNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logoIcon}>A</div>
        <span className={styles.logoText}>ACME Corp</span>
      </div>

      <nav className={styles.navMenu}>
        <button
          className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <TrendingUp size={18} />
          <span>Dashboard</span>
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'directory' ? styles.navItemActive : ''}`}
          onClick={() => onTabChange('directory')}
        >
          <Users size={18} />
          <span>Employee Directory</span>
        </button>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>HR</div>
          <div className={styles.userInfo}>
            <h4>HR Manager</h4>
            <p>Acme Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface PageHeaderProps {
  activeTab: ActiveTab;
  onAddEmployee: () => void;
  onRefresh: () => void;
}

export function PageHeader({ activeTab, onAddEmployee, onRefresh }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInfo}>
        <h1>{activeTab === 'dashboard' ? 'Compensation Dashboard' : 'Employee Directory'}</h1>
        <p>
          {activeTab === 'dashboard'
            ? 'Organizational payroll costs, distributions, and pay equity analytics.'
            : 'Search, filter, onboard, and manage employee salary adjustments.'}
        </p>
      </div>

      <div className={styles.headerActions}>
        {activeTab === 'directory' && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onAddEmployee}>
            <Plus size={16} />
            <span>Onboard Employee</span>
          </button>
        )}
        <button
          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnIconOnly}`}
          onClick={onRefresh}
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  );
}

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
        <select
          value={filterCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className={styles.selectInput}
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((country) => (
            <option key={country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Department</label>
        <select
          value={filterDept}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className={styles.selectInput}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      {(filterCountry || filterDept) && (
        <button className={styles.clearButton} onClick={onReset}>
          Reset Filters
        </button>
      )}
    </section>
  );
}

interface DashboardViewProps {
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;
  isMounted: boolean;
}

export function DashboardView({
  dashboardData,
  dashboardLoading,
  isMounted,
}: DashboardViewProps) {
  if (dashboardLoading) return <LoadingView />;

  return (
    <>
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.glassCard}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Headcount</span>
            <div className={styles.kpiIcon}>
              <Users size={16} />
            </div>
          </div>
          <h2 className={styles.kpiValue}>{dashboardData?.totals.totalHeadcount}</h2>
          <span className={styles.kpiSubtext}>Total active employees</span>
        </div>

        <div className={`${styles.kpiCard} ${styles.glassCard}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Payroll (USD)</span>
            <div className={styles.kpiIcon}>
              <DollarSign size={16} />
            </div>
          </div>
          <h2
            className={styles.kpiValue}
            title={formatUSD(dashboardData?.totals.totalPayrollUSD || 0)}
          >
            {formatCompact(dashboardData?.totals.totalPayrollUSD || 0)}
          </h2>
          <span className={styles.kpiSubtext}>Annualized total payroll cost</span>
        </div>

        <div className={`${styles.kpiCard} ${styles.glassCard}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Average Salary (USD)</span>
            <div className={styles.kpiIcon}>
              <TrendingUp size={16} />
            </div>
          </div>
          <h2
            className={styles.kpiValue}
            title={formatUSD(dashboardData?.totals.averageSalaryUSD || 0)}
          >
            {formatCompact(dashboardData?.totals.averageSalaryUSD || 0)}
          </h2>
          <span className={styles.kpiSubtext}>Mean compensation cost</span>
        </div>

        <div className={`${styles.kpiCard} ${styles.glassCard}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Median Salary (USD)</span>
            <div className={styles.kpiIcon}>
              <Percent size={16} />
            </div>
          </div>
          <h2
            className={styles.kpiValue}
            title={formatUSD(dashboardData?.totals.medianSalaryUSD || 0)}
          >
            {formatCompact(dashboardData?.totals.medianSalaryUSD || 0)}
          </h2>
          <span className={styles.kpiSubtext}>Mid-point compensation cost</span>
        </div>
      </div>

      {isMounted && (
        <div className={styles.chartsGrid}>
          <div className={`${styles.chartCard} ${styles.glassCard}`}>
            <div className={styles.chartHeader}>
              <span className={styles.chartTitle}>Average Salary by Department (USD)</span>
              <Briefcase size={16} className={styles.textMuted} />
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData?.byDepartment || []}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3547" />
                  <XAxis dataKey="department" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                    formatter={(value) => [formatUSD(Number(value) || 0), 'Average Salary']}
                  />
                  <Bar dataKey="averageSalaryUSD" fill="url(#primaryGrad)" radius={[4, 4, 0, 0]} name="Avg Salary" />
                  <defs>
                    <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${styles.chartCard} ${styles.glassCard}`}>
            <div className={styles.chartHeader}>
              <span className={styles.chartTitle}>Department Average Salary by Gender (USD)</span>
              <Percent size={16} className={styles.textMuted} />
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData?.genderGap || []}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3547" />
                  <XAxis dataKey="department" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                    formatter={(value) => [formatUSD(Number(value) || 0), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="maleAvgUSD" fill="#3b82f6" name="Male Avg" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="femaleAvgUSD" fill="#ec4899" name="Female Avg" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${styles.chartCard} ${styles.glassCard} ${styles.formSpanFull}`}>
            <div className={styles.chartHeader}>
              <span className={styles.chartTitle}>Headcount & Payroll Cost by Country</span>
              <Globe size={16} className={styles.textMuted} />
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData?.byCountry || []}
                  margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3547" />
                  <XAxis dataKey="country" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#818cf8" tick={{ fill: '#818cf8', fontSize: 11 }} tickFormatter={(v) => `$${v / 1000000}M`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#34d399" tick={{ fill: '#34d399', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="totalPayrollUSD" fill="#4f46e5" name="Total Payroll (USD)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="headcount" fill="#10b981" name="Headcount (FTE)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
                        <span className={`${styles.badge} ${styles.badgeDept}`}>{employee.department}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeCountry}`}>{employee.country}</span>
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
                          <button
                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                            onClick={() => onEditEmployee(employee)}
                            title="Adjust Salary"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                            onClick={() => onDeleteEmployee(employee)}
                            title="Terminate Employee"
                          >
                            <Trash2 size={14} />
                          </button>
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
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane"
                  className={styles.formInput}
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  className={styles.formInput}
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div className={`${styles.formGroup} ${styles.formSpanFull}`}>
                <label>Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@acme.com"
                  className={styles.formInput}
                  value={addForm.email}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Gender *</label>
                <select
                  className={styles.selectInput}
                  value={addForm.gender}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Lead Devops Engineer"
                  className={styles.formInput}
                  value={addForm.jobTitle}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Department *</label>
                <select
                  className={styles.selectInput}
                  value={addForm.department}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, department: e.target.value }))}
                >
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Location *</label>
                <select
                  className={styles.selectInput}
                  value={addForm.country}
                  onChange={(e) => onCountryChange(e.target.value)}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Local Currency</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  className={`${styles.formInput} ${styles.textMuted}`}
                  value={addForm.currency}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Annual Salary (Local Currency) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 85000"
                  className={styles.formInput}
                  value={addForm.salary}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, salary: e.target.value }))}
                />
              </div>
            </div>
            {formError && <div className={styles.formError}>{formError}</div>}
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              Onboard Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Adjust Employee Salary</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className={styles.modalBody}>
            <div style={{ marginBottom: '16px', fontSize: '14px' }}>
              Adjust compensation for <strong>{editingEmployee.firstName} {editingEmployee.lastName}</strong> ({editingEmployee.jobTitle}).
            </div>

            <div className={styles.comparisonBox}>
              <div className={styles.compVal}>
                <label>Current Salary</label>
                <span>{formatLocalSalary(editingEmployee.salary, editingEmployee.currency)}</span>
              </div>
              <span className={styles.compArrow}>→</span>
              <div className={styles.compVal}>
                <label>Proposed Salary</label>
                <span>{formatLocalSalary(parseFloat(editSalaryVal) || 0, editingEmployee.currency)}</span>
              </div>
              <div className={styles.compVal}>
                <label>Change %</label>
                <span
                  className={
                    (parseFloat(editSalaryVal) || 0) >= editingEmployee.salary
                      ? styles.compValDelta
                      : styles.formError
                  }
                >
                  {editingEmployee.salary > 0 && parseFloat(editSalaryVal)
                    ? `${(((parseFloat(editSalaryVal) - editingEmployee.salary) / editingEmployee.salary) * 100).toFixed(1)}%`
                    : '0.0%'}
                </span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>New Annual Salary ({editingEmployee.currency}) *</label>
              <input
                type="number"
                required
                min="0"
                className={styles.formInput}
                value={editSalaryVal}
                onChange={(e) => onSalaryChange(e.target.value)}
                placeholder="Enter new compensation..."
              />
            </div>

            {editError && <div className={styles.formError}>{editError}</div>}
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
          <button className={styles.closeButton} onClick={onClose}>
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
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={onConfirm}>
            Confirm Termination
          </button>
        </div>
      </div>
    </div>
  );
}
