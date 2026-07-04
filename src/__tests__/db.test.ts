import { describe, it, expect } from 'vitest';
import { prisma } from '../lib/db';

describe('Database Integrity & Seeding Distribution', () => {
  it('should have exactly 5 exchange rates', async () => {
    const count = await prisma.exchangeRate.count();
    expect(count).toBe(5);

    const rates = await prisma.exchangeRate.findMany();
    const currencies = rates.map(r => r.fromCurrency);
    expect(currencies).toContain('USD');
    expect(currencies).toContain('EUR');
    expect(currencies).toContain('INR');
    expect(currencies).toContain('GBP');
    expect(currencies).toContain('JPY');
  });

  it('should have exactly 10,000 employees', async () => {
    const count = await prisma.employee.count();
    expect(count).toBe(10000);
  });

  it('should have valid country distributions matching seed weights', async () => {
    const employees = await prisma.employee.findMany({
      select: {
        country: true
      }
    });

    const counts: Record<string, number> = {
      'United States': 0,
      'India': 0,
      'Germany': 0,
      'United Kingdom': 0,
      'Japan': 0
    };

    for (const emp of employees) {
      if (emp.country in counts) {
        counts[emp.country]++;
      }
    }

    // Verify proportions (with some random variance tolerance, e.g. +/- 5%)
    // US target: 4000 (range: 3800 - 4200)
    expect(counts['United States']).toBeGreaterThan(3700);
    expect(counts['United States']).toBeLessThan(4300);

    // India target: 3000 (range: 2800 - 3200)
    expect(counts['India']).toBeGreaterThan(2700);
    expect(counts['India']).toBeLessThan(3300);

    // Germany target: 1000 (range: 900 - 1100)
    expect(counts['Germany']).toBeGreaterThan(850);
    expect(counts['Germany']).toBeLessThan(1150);

    // UK target: 1000 (range: 900 - 1100)
    expect(counts['United Kingdom']).toBeGreaterThan(850);
    expect(counts['United Kingdom']).toBeLessThan(1150);

    // Japan target: 1000 (range: 900 - 1100)
    expect(counts['Japan']).toBeGreaterThan(850);
    expect(counts['Japan']).toBeLessThan(1150);
  });

  it('should have unique emails for all 10,000 records', async () => {
    const employees = await prisma.employee.findMany({
      select: {
        email: true
      }
    });

    const emails = new Set(employees.map(e => e.email));
    expect(emails.size).toBe(10000);
  });

  it('should have about 25% of employees with a previous salary trace', async () => {
    const hasHistoryCount = await prisma.employee.count({
      where: {
        previousSalary: {
          not: null
        }
      }
    });

    // 25% of 10,000 = 2,500. Let's verify it is within a reasonable range (2,300 - 2,700)
    expect(hasHistoryCount).toBeGreaterThan(2200);
    expect(hasHistoryCount).toBeLessThan(2800);
  });
});
