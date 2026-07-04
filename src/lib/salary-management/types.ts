export interface Employee {
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

export interface DashboardData {
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
