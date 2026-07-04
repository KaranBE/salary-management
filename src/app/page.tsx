'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Briefcase, 
  Globe, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import styles from './page.module.css';

// Type definitions
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  previousSalary: number | null;
  salaryUpdatedAt: string;
  createdAt: string;
}

interface DashboardData {
  totals: {
    totalPayrollUSD: number;
    averageSalaryUSD: number;
    medianSalaryUSD: number;
    totalHeadcount: number;
  };
  byDepartment: Array<{
    department: string;
    averageSalaryUSD: number;
    medianSalaryUSD: number;
    headcount: number;
  }>;
  byCountry: Array<{
    country: string;
    averageSalaryUSD: number;
    medianSalaryUSD: number;
    totalPayrollUSD: number;
    headcount: number;
  }>;
  genderGap: Array<{
    department: string;
    maleAvgUSD: number;
    femaleAvgUSD: number;
    maleCount: number;
    femaleCount: number;
    gapPercentage: number;
  }>;
}

// Option Lists
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Product', 'Human Resources', 'Finance'];
const COUNTRIES = [
  { name: 'United States', currency: 'USD' },
  { name: 'Germany', currency: 'EUR' },
  { name: 'India', currency: 'INR' },
  { name: 'United Kingdom', currency: 'GBP' },
  { name: 'Japan', currency: 'JPY' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory'>('dashboard');
  const [isMounted, setIsMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Global Filters
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('');

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);

  // Directory Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 20;

  // Add Employee Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'Male',
    jobTitle: '',
    department: DEPARTMENTS[0],
    country: COUNTRIES[0].name,
    currency: COUNTRIES[0].currency,
    salary: ''
  });
  const [formError, setFormError] = useState<string>('');

  // Edit Salary Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editSalaryVal, setEditSalaryVal] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  // Terminate Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Mounted safety check for SSR-sensitive charting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Dashboard Analytics
  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const params = new URLSearchParams();
      if (filterCountry) params.append('country', filterCountry);
      if (filterDept) params.append('department', filterDept);

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load dashboard metrics');
      const data = await res.json();
      setDashboardData(data);
    } catch (err: any) {
      showToast(err.message || 'Error loading dashboard', 'error');
    } finally {
      setDashboardLoading(false);
    }
  }, [filterCountry, filterDept]);

  // Fetch Employee Directory — searchQuery is passed as a parameter to avoid
  // including it in the dependency array, which would cause the main useEffect
  // (that fires on tab/filter/page changes) to also re-fire on every keystroke,
  // creating a double-fetch. The debounced effect below is the sole owner of
  // search-triggered fetches.
  const fetchEmployees = useCallback(async (search: string = searchQuery) => {
    try {
      setDirectoryLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      });
      if (search) params.append('search', search);
      if (filterCountry) params.append('country', filterCountry);
      if (filterDept) params.append('department', filterDept);

      const res = await fetch(`/api/employees?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load employee list');
      const data = await res.json();
      setEmployees(data.data);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      showToast(err.message || 'Error loading employee list', 'error');
    } finally {
      setDirectoryLoading(false);
    }
  // searchQuery intentionally omitted — search changes are handled by the
  // debounced effect below to prevent double-fetch on every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterCountry, filterDept]);

  // Trigger loads when tab, filter, or page changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else {
      fetchEmployees();
    }
  }, [activeTab, fetchDashboard, fetchEmployees]);

  // Debounced search — sole trigger for search-driven fetches.
  // Resets to page 1 and passes the latest query value directly to avoid
  // the stale-closure race that would occur if we relied on the state value.
  useEffect(() => {
    if (activeTab !== 'directory') return;
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchEmployees(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Currency format helpers
  const formatLocalSalary = (value: number, currency: string) => {
    const locales: Record<string, string> = {
      USD: 'en-US',
      EUR: 'de-DE',
      INR: 'en-IN',
      GBP: 'en-GB',
      JPY: 'ja-JP'
    };
    return new Intl.NumberFormat(locales[currency] || 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Compact formatter for KPI cards: $8,234,567 → $8.2M
  const formatCompact = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return formatUSD(value);
  };

  // Add Employee Handler
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { firstName, lastName, email, gender, jobTitle, department, country, currency, salary } = addForm;

    if (!firstName || !lastName || !email || !jobTitle || !salary) {
      setFormError('Please fill out all required fields.');
      return;
    }

    const parsedSalary = parseFloat(salary);
    if (isNaN(parsedSalary) || parsedSalary <= 0) {
      setFormError('Please enter a valid positive salary.');
      return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          gender,
          jobTitle,
          department,
          country,
          currency,
          salary: parsedSalary
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboarding employee');

      showToast('Employee successfully onboarded!');
      setIsAddOpen(false);
      // Reset form
      setAddForm({
        firstName: '',
        lastName: '',
        email: '',
        gender: 'Male',
        jobTitle: '',
        department: DEPARTMENTS[0],
        country: COUNTRIES[0].name,
        currency: COUNTRIES[0].currency,
        salary: ''
      });
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // Edit Salary Handler
  const handleEditSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editingEmployee) return;

    const parsedSalary = parseFloat(editSalaryVal);
    if (isNaN(parsedSalary) || parsedSalary <= 0) {
      setEditError('Please enter a valid positive salary amount.');
      return;
    }

    try {
      const res = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: parsedSalary })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update salary');

      showToast('Salary adjusted successfully!');
      setIsEditOpen(false);
      setEditingEmployee(null);
      setEditSalaryVal('');
      fetchEmployees();
    } catch (err: any) {
      setEditError(err.message);
    }
  };

  // Delete Employee Handler
  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      const res = await fetch(`/api/employees/${deletingEmployee.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to terminate employee');

      showToast('Employee terminated successfully.');
      setIsDeleteOpen(false);
      setDeletingEmployee(null);
      
      // If we deleted the last item on the page, go back
      if (employees.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchEmployees();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Sync country selection with default currency
  const handleCountryChange = (countryName: string) => {
    const match = COUNTRIES.find(c => c.name === countryName);
    setAddForm(prev => ({
      ...prev,
      country: countryName,
      currency: match ? match.currency : 'USD'
    }));
  };

  return (
    <div className={styles.container}>
      {/* Toast Alert */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          <Info size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>A</div>
          <span className={styles.logoText}>ACME Corp</span>
        </div>

        <nav className={styles.navMenu}>
          <button 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <TrendingUp size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'directory' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('directory')}
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

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Header section */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h1>{activeTab === 'dashboard' ? 'Compensation Dashboard' : 'Employee Directory'}</h1>
            <p>
              {activeTab === 'dashboard' 
                ? 'Organizational payroll costs, distributions, and pay equity analytics.' 
                : 'Search, filter, onboard, and manage employee salary adjustments.'
              }
            </p>
          </div>
          
          <div className={styles.headerActions}>
            {activeTab === 'directory' && (
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsAddOpen(true)}>
                <Plus size={16} />
                <span>Onboard Employee</span>
              </button>
            )}
            <button 
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnIconOnly}`} 
              onClick={() => activeTab === 'dashboard' ? fetchDashboard() : fetchEmployees()}
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {/* Global Filters */}
        <section className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label>Country</label>
            <select 
              value={filterCountry} 
              onChange={(e) => { setFilterCountry(e.target.value); setCurrentPage(1); }}
              className={styles.selectInput}
            >
              <option value="">All Countries</option>
              {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Department</label>
            <select 
              value={filterDept} 
              onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
              className={styles.selectInput}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {(filterCountry || filterDept) && (
            <button 
              className={styles.clearButton}
              onClick={() => {
                setFilterCountry('');
                setFilterDept('');
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </button>
          )}
        </section>

        {/* Tabs Render View */}
        {activeTab === 'dashboard' ? (
          // DASHBOARD ANALYTICS VIEW
          dashboardLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            <>
              {/* Dashboard KPI Grid */}
              <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} ${styles.glassCard}`}>
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiTitle}>Headcount</span>
                    <div className={styles.kpiIcon}><Users size={16} /></div>
                  </div>
                  <h2 className={styles.kpiValue}>{dashboardData?.totals.totalHeadcount}</h2>
                  <span className={styles.kpiSubtext}>Total active employees</span>
                </div>

                <div className={`${styles.kpiCard} ${styles.glassCard}`}>
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiTitle}>Total Payroll (USD)</span>
                    <div className={styles.kpiIcon}><DollarSign size={16} /></div>
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
                    <div className={styles.kpiIcon}><TrendingUp size={16} /></div>
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
                    <div className={styles.kpiIcon}><Percent size={16} /></div>
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

              {/* Recharts Grid (Only rendered if mounted on client) */}
              {isMounted && (
                <div className={styles.chartsGrid}>
                  {/* Department Average Salary */}
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
                          <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }} 
                            formatter={(v: any) => [formatUSD(Number(v) || 0), 'Average Salary']}
                          />
                          <Bar dataKey="averageSalaryUSD" fill="url(#primaryGrad)" radius={[4, 4, 0, 0]} name="Avg Salary" />
                          <defs>
                            <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gender Pay Gap Chart */}
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
                          <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                            formatter={(v: any) => [formatUSD(Number(v) || 0), '']}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Bar dataKey="maleAvgUSD" fill="#3b82f6" name="Male Avg" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="femaleAvgUSD" fill="#ec4899" name="Female Avg" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Country Breakdown (Totals vs Average) */}
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
                          <YAxis yAxisId="left" stroke="#818cf8" tick={{ fill: '#818cf8', fontSize: 11 }} tickFormatter={(v) => `$${v/1000000}M`} />
                          <YAxis yAxisId="right" orientation="right" stroke="#34d399" tick={{ fill: '#34d399', fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }} 
                          />
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
          )
        ) : (
          // EMPLOYEE DIRECTORY VIEW
          <section className={`${styles.directoryCard} ${styles.glassCard}`}>
            {/* Toolbar search & filters */}
            <div className={styles.tableToolbar}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search name, email, job title..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className={styles.paginationInfo}>
                Found <strong>{totalCount}</strong> employees
              </div>
            </div>

            {/* Loading table spinner */}
            {directoryLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
              </div>
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
                        employees.map((emp) => (
                          <tr key={emp.id}>
                            <td>
                              <div className={styles.empName}>
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className={styles.empEmail}>
                                {emp.jobTitle} • {emp.email}
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${styles.badgeDept}`}>{emp.department}</span>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${styles.badgeCountry}`}>{emp.country}</span>
                            </td>
                            <td>
                              <div className={styles.salaryField}>
                                {formatLocalSalary(emp.salary, emp.currency)}
                              </div>
                              {emp.previousSalary && (
                                <div className={styles.previousSalary}>
                                  Was {formatLocalSalary(emp.previousSalary, emp.currency)}
                                </div>
                              )}
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {new Date(emp.salaryUpdatedAt).toLocaleDateString(undefined, { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </td>
                            <td>
                              <div className={styles.actionCell}>
                                <button 
                                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                  onClick={() => {
                                    setEditingEmployee(emp);
                                    setEditSalaryVal(emp.salary.toString());
                                    setEditError('');
                                    setIsEditOpen(true);
                                  }}
                                  title="Adjust Salary"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                  onClick={() => {
                                    setDeletingEmployee(emp);
                                    setIsDeleteOpen(true);
                                  }}
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

                {/* Table Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (showing {employees.length} of {totalCount} records)
                    </div>
                    <div className={styles.paginationButtons}>
                      <button 
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        <ChevronLeft size={14} />
                        <span>Prev</span>
                      </button>
                      
                      <button 
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
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
        )}
      </main>

      {/* MODALS SECTION */}

      {/* 1. ONBOARD EMPLOYEE MODAL */}
      {isAddOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Onboard New Employee</h3>
              <button className={styles.closeButton} onClick={() => setIsAddOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEmployee}>
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
                      onChange={(e) => setAddForm(prev => ({ ...prev, firstName: e.target.value }))}
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
                      onChange={(e) => setAddForm(prev => ({ ...prev, lastName: e.target.value }))}
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
                      onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Gender *</label>
                    <select 
                      className={styles.selectInput}
                      value={addForm.gender}
                      onChange={(e) => setAddForm(prev => ({ ...prev, gender: e.target.value }))}
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
                      onChange={(e) => setAddForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Department *</label>
                    <select 
                      className={styles.selectInput}
                      value={addForm.department}
                      onChange={(e) => setAddForm(prev => ({ ...prev, department: e.target.value }))}
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Location *</label>
                    <select 
                      className={styles.selectInput}
                      value={addForm.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                    >
                      {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
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
                      onChange={(e) => setAddForm(prev => ({ ...prev, salary: e.target.value }))}
                    />
                  </div>
                </div>
                {formError && <div className={styles.formError}>{formError}</div>}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Onboard Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADJUST SALARY MODAL */}
      {isEditOpen && editingEmployee && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Adjust Employee Salary</h3>
              <button className={styles.closeButton} onClick={() => { setIsEditOpen(false); setEditingEmployee(null); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSalary}>
              <div className={styles.modalBody}>
                <div style={{ marginBottom: '16px', fontSize: '14px' }}>
                  Adjust compensation for <strong>{editingEmployee.firstName} {editingEmployee.lastName}</strong> ({editingEmployee.jobTitle}).
                </div>

                {/* Audit Comparison Details */}
                <div className={styles.comparisonBox}>
                  <div className={styles.compVal}>
                    <label>Current Salary</label>
                    <span>{formatLocalSalary(editingEmployee.salary, editingEmployee.currency)}</span>
                  </div>
                  <span className={styles.compArrow}>→</span>
                  <div className={styles.compVal}>
                    <label>Proposed Salary</label>
                    <span>
                      {formatLocalSalary(
                        parseFloat(editSalaryVal) || 0,
                        editingEmployee.currency
                      )}
                    </span>
                  </div>
                  <div className={styles.compVal}>
                    <label>Change %</label>
                    <span className={
                      (parseFloat(editSalaryVal) || 0) >= editingEmployee.salary 
                        ? styles.compValDelta 
                        : styles.formError
                    }>
                      {editingEmployee.salary > 0 && parseFloat(editSalaryVal) 
                        ? `${(((parseFloat(editSalaryVal) - editingEmployee.salary) / editingEmployee.salary) * 100).toFixed(1)}%`
                        : '0.0%'
                      }
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
                    onChange={(e) => setEditSalaryVal(e.target.value)}
                    placeholder="Enter new compensation..."
                  />
                </div>

                {editError && <div className={styles.formError}>{editError}</div>}
              </div>
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btnSecondary}`} 
                  onClick={() => { setIsEditOpen(false); setEditingEmployee(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TERMINATE EMPLOYEE MODAL (DELETE CONFIRMATION) */}
      {isDeleteOpen && deletingEmployee && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 style={{ color: 'var(--danger)' }}>Terminate Employee</h3>
              <button className={styles.closeButton} onClick={() => { setIsDeleteOpen(false); setDeletingEmployee(null); }}>
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
              <button 
                type="button" 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                onClick={() => { setIsDeleteOpen(false); setDeletingEmployee(null); }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={`${styles.btn} ${styles.btnDanger}`} 
                onClick={handleDeleteEmployee}
              >
                Confirm Termination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
