import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateMetrics } from '@/lib/analytics';

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

    const metrics = calculateMetrics(employees, rateMap);
    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error('Error generating dashboard metrics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
