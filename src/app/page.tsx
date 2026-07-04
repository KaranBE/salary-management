'use client';

import { useCallback, useEffect, useState } from 'react';
import { COUNTRIES, DEPARTMENTS } from '@/lib/salary-management/constants';
import type { DashboardData, Employee } from '@/lib/salary-management/types';
import {
  AddEmployeeModal,
  type AddEmployeeFormState,
  DashboardView,
  DeleteEmployeeModal,
  DirectoryView,
  EditSalaryModal,
  GlobalFilters,
  PageHeader,
  SidebarNavigation,
  ToastAlert,
} from './salary-management-components';
import styles from './page.module.css';

type ActiveTab = 'dashboard' | 'directory';

const INITIAL_ADD_FORM: AddEmployeeFormState = {
  firstName: '',
  lastName: '',
  email: '',
  gender: 'Male',
  jobTitle: '',
  department: DEPARTMENTS[0],
  country: COUNTRIES[0].name,
  currency: COUNTRIES[0].currency,
  salary: '',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMounted, setIsMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [filterCountry, setFilterCountry] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddEmployeeFormState>(INITIAL_ADD_FORM);
  const [formError, setFormError] = useState('');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editSalaryVal, setEditSalaryVal] = useState('');
  const [editError, setEditError] = useState('');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const fetchEmployees = useCallback(async (search: string = searchQuery) => {
    try {
      setDirectoryLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
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
  // searchQuery intentionally omitted; the debounced effect owns search-driven fetches.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterCountry, filterDept]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else {
      fetchEmployees();
    }
  }, [activeTab, fetchDashboard, fetchEmployees]);

  useEffect(() => {
    if (activeTab !== 'directory') return;
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchEmployees(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, fetchEmployees]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { firstName, lastName, email, gender, jobTitle, department, country, currency, salary } = addForm;

    if (!firstName || !lastName || !email || !jobTitle || !salary) {
      setFormError('Please fill out all required fields.');
      return;
    }

    const parsedSalary = parseFloat(salary);
    if (Number.isNaN(parsedSalary) || parsedSalary <= 0) {
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
          salary: parsedSalary,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboarding employee');

      showToast('Employee successfully onboarded!');
      setIsAddOpen(false);
      setAddForm(INITIAL_ADD_FORM);
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleEditSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editingEmployee) return;

    const parsedSalary = parseFloat(editSalaryVal);
    if (Number.isNaN(parsedSalary) || parsedSalary <= 0) {
      setEditError('Please enter a valid positive salary amount.');
      return;
    }

    try {
      const res = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: parsedSalary }),
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

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      const res = await fetch(`/api/employees/${deletingEmployee.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to terminate employee');

      showToast('Employee terminated successfully.');
      setIsDeleteOpen(false);
      setDeletingEmployee(null);

      if (employees.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchEmployees();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCountryChange = (countryName: string) => {
    const match = COUNTRIES.find((country) => country.name === countryName);
    setAddForm((prev) => ({
      ...prev,
      country: countryName,
      currency: match ? match.currency : 'USD',
    }));
  };

  const handleFilterCountryChange = (value: string) => {
    setFilterCountry(value);
    setCurrentPage(1);
  };

  const handleFilterDeptChange = (value: string) => {
    setFilterDept(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilterCountry('');
    setFilterDept('');
    setCurrentPage(1);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditSalaryVal(employee.salary.toString());
    setEditError('');
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingEmployee(null);
  };

  const openDeleteModal = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setDeletingEmployee(null);
  };

  return (
    <div className={styles.container}>
      <ToastAlert toast={toast} />
      <SidebarNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className={styles.mainContent}>
        <PageHeader
          activeTab={activeTab}
          onAddEmployee={() => setIsAddOpen(true)}
          onRefresh={() => (activeTab === 'dashboard' ? fetchDashboard() : fetchEmployees())}
        />

        <GlobalFilters
          filterCountry={filterCountry}
          filterDept={filterDept}
          onCountryChange={handleFilterCountryChange}
          onDepartmentChange={handleFilterDeptChange}
          onReset={resetFilters}
        />

        {activeTab === 'dashboard' ? (
          <DashboardView
            dashboardData={dashboardData}
            dashboardLoading={dashboardLoading}
            isMounted={isMounted}
          />
        ) : (
          <DirectoryView
            employees={employees}
            directoryLoading={directoryLoading}
            searchQuery={searchQuery}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
            onSearchChange={setSearchQuery}
            onEditEmployee={openEditModal}
            onDeleteEmployee={openDeleteModal}
            onPreviousPage={() => setCurrentPage((prev) => prev - 1)}
            onNextPage={() => setCurrentPage((prev) => prev + 1)}
          />
        )}
      </main>

      <AddEmployeeModal
        isOpen={isAddOpen}
        addForm={addForm}
        formError={formError}
        setAddForm={setAddForm}
        onClose={() => setIsAddOpen(false)}
        onCountryChange={handleCountryChange}
        onSubmit={handleAddEmployee}
      />

      <EditSalaryModal
        isOpen={isEditOpen}
        editingEmployee={editingEmployee}
        editSalaryVal={editSalaryVal}
        editError={editError}
        onClose={closeEditModal}
        onSubmit={handleEditSalary}
        onSalaryChange={setEditSalaryVal}
      />

      <DeleteEmployeeModal
        isOpen={isDeleteOpen}
        deletingEmployee={deletingEmployee}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteEmployee}
      />
    </div>
  );
}
