import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { salary } = body;

    if (salary === undefined) {
      return NextResponse.json({ error: 'Salary is required' }, { status: 400 });
    }

    const parsedSalary = parseFloat(salary);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      return NextResponse.json({ error: 'Invalid salary amount' }, { status: 400 });
    }

    // Get current employee
    const currentEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!currentEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Update salary history if it has changed
    const previousSalary = currentEmployee.salary === parsedSalary 
      ? currentEmployee.previousSalary 
      : currentEmployee.salary;
      
    const salaryUpdatedAt = currentEmployee.salary === parsedSalary 
      ? currentEmployee.salaryUpdatedAt 
      : new Date();

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        salary: parsedSalary,
        previousSalary,
        salaryUpdatedAt,
      },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error: any) {
    console.error('Error updating employee salary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Employee terminated successfully' });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
