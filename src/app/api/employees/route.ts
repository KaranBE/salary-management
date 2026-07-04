import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const country = searchParams.get('country') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { jobTitle: { contains: search } },
      ];
    }

    if (department) {
      where.department = department;
    }

    if (country) {
      where.country = country;
    }

    const [employees, totalCount] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      data: employees,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, gender, jobTitle, department, country, currency, salary } = body;

    // Validation
    if (!firstName || !lastName || !email || !gender || !jobTitle || !department || !country || !currency || salary === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedSalary = parseFloat(salary);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      return NextResponse.json({ error: 'Invalid salary amount' }, { status: 400 });
    }

    // Check unique email
    const existing = await prisma.employee.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        gender,
        jobTitle,
        department,
        country,
        currency,
        salary: parsedSalary,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
