export type ActiveTab = 'dashboard' | 'directory';

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

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}
