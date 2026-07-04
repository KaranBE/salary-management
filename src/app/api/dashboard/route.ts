import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function getMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterCountry = searchParams.get('country') || '';
    const filterDepartment = searchParams.get('department') || '';

    // Fetch exchange rates and create a map
    const exchangeRates = await prisma.exchangeRate.findMany();
    const rateMap = new Map<string, number>();
    for (const rate of exchangeRates) {
      rateMap.set(rate.fromCurrency, rate.rate);
    }

    const where: any = {};
    if (filterCountry) where.country = filterCountry;
    if (filterDepartment) where.department = filterDepartment;

    // Fetch all employees with only the required fields for calculations
    const employees = await prisma.employee.findMany({
      where,
      select: {
        salary: true,
        currency: true,
        department: true,
        country: true,
        gender: true,
      },
    });

    const totalHeadcount = employees.length;
    if (totalHeadcount === 0) {
      return NextResponse.json({
        totals: { totalPayrollUSD: 0, averageSalaryUSD: 0, medianSalaryUSD: 0, totalHeadcount: 0 },
        byDepartment: [],
        byCountry: [],
        genderGap: [],
      });
    }

    let totalPayrollUSD = 0;
    const allSalariesUSD: number[] = [];

    const deptMap = new Map<string, { salaries: number[] }>();
    const countryMap = new Map<string, { salaries: number[], totalPayroll: number }>();
    const genderMap = new Map<string, { Male: number[], Female: number[], NonBinary: number[] }>();

    for (const emp of employees) {
      const rate = rateMap.get(emp.currency) || 1.0;
      const salaryUSD = emp.salary * rate;

      totalPayrollUSD += salaryUSD;
      allSalariesUSD.push(salaryUSD);

      // Department grouping
      if (!deptMap.has(emp.department)) {
        deptMap.set(emp.department, { salaries: [] });
      }
      deptMap.get(emp.department)!.salaries.push(salaryUSD);

      // Country grouping
      if (!countryMap.has(emp.country)) {
        countryMap.set(emp.country, { salaries: [], totalPayroll: 0 });
      }
      const countryData = countryMap.get(emp.country)!;
      countryData.salaries.push(salaryUSD);
      countryData.totalPayroll += salaryUSD;

      // Gender grouping inside department for pay gap analysis
      if (!genderMap.has(emp.department)) {
        genderMap.set(emp.department, { Male: [], Female: [], NonBinary: [] });
      }
      const deptGenderData = genderMap.get(emp.department)!;
      if (emp.gender === 'Male') {
        deptGenderData.Male.push(salaryUSD);
      } else if (emp.gender === 'Female') {
        deptGenderData.Female.push(salaryUSD);
      } else {
        deptGenderData.NonBinary.push(salaryUSD);
      }
    }

    const averageSalaryUSD = totalPayrollUSD / totalHeadcount;
    const medianSalaryUSD = getMedian(allSalariesUSD);

    // Format Department Metrics
    const byDepartment = Array.from(deptMap.entries()).map(([deptName, data]) => {
      const deptTotal = data.salaries.reduce((sum, val) => sum + val, 0);
      return {
        department: deptName,
        averageSalaryUSD: Math.round(deptTotal / data.salaries.length),
        medianSalaryUSD: Math.round(getMedian(data.salaries)),
        headcount: data.salaries.length,
      };
    }).sort((a, b) => b.averageSalaryUSD - a.averageSalaryUSD);

    // Format Country Metrics
    const byCountry = Array.from(countryMap.entries()).map(([countryName, data]) => {
      return {
        country: countryName,
        averageSalaryUSD: Math.round(data.totalPayroll / data.salaries.length),
        medianSalaryUSD: Math.round(getMedian(data.salaries)),
        totalPayrollUSD: Math.round(data.totalPayroll),
        headcount: data.salaries.length,
      };
    }).sort((a, b) => b.totalPayrollUSD - a.totalPayrollUSD);

    // Format Gender Gap Metrics
    const genderGap = Array.from(genderMap.entries()).map(([deptName, data]) => {
      const maleAvg = data.Male.length > 0 
        ? data.Male.reduce((sum, val) => sum + val, 0) / data.Male.length 
        : 0;
      const femaleAvg = data.Female.length > 0 
        ? data.Female.reduce((sum, val) => sum + val, 0) / data.Female.length 
        : 0;

      // Gap = (Male Avg - Female Avg) / Male Avg * 100
      const gapPercentage = maleAvg > 0 ? ((maleAvg - femaleAvg) / maleAvg) * 100 : 0;

      return {
        department: deptName,
        maleAvgUSD: Math.round(maleAvg),
        femaleAvgUSD: Math.round(femaleAvg),
        maleCount: data.Male.length,
        femaleCount: data.Female.length,
        gapPercentage: parseFloat(gapPercentage.toFixed(2)),
      };
    }).sort((a, b) => b.gapPercentage - a.gapPercentage);

    return NextResponse.json({
      totals: {
        totalPayrollUSD: Math.round(totalPayrollUSD),
        averageSalaryUSD: Math.round(averageSalaryUSD),
        medianSalaryUSD: Math.round(medianSalaryUSD),
        totalHeadcount,
      },
      byDepartment,
      byCountry,
      genderGap,
    });
  } catch (error: any) {
    console.error('Error generating dashboard metrics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
