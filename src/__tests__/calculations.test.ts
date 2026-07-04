import { describe, it, expect } from 'vitest';
import { getMedian, calculateMetrics, RawEmployee } from '../lib/analytics';

describe('Compensation Calculations', () => {
  describe('getMedian', () => {
    it('returns 0 for empty array', () => {
      expect(getMedian([])).toBe(0);
    });

    it('calculates median for odd-length array', () => {
      expect(getMedian([10, 50, 20])).toBe(20);
    });

    it('calculates median for even-length array', () => {
      expect(getMedian([10, 50, 20, 40])).toBe(30);
    });
  });

  describe('calculateMetrics', () => {
    const mockExchangeRates = new Map<string, number>([
      ['USD', 1.0],
      ['EUR', 1.10],
      ['INR', 0.012]
    ]);

    it('returns empty structure for zero employees', () => {
      const result = calculateMetrics([], mockExchangeRates);
      expect(result.totals.totalHeadcount).toBe(0);
      expect(result.totals.totalPayrollUSD).toBe(0);
      expect(result.byDepartment).toHaveLength(0);
      expect(result.byCountry).toHaveLength(0);
      expect(result.genderGap).toHaveLength(0);
    });

    it('calculates correct aggregated metrics', () => {
      const mockEmployees: RawEmployee[] = [
        // US (USD)
        { salary: 100000, currency: 'USD', department: 'Engineering', country: 'United States', gender: 'Male' },
        { salary: 120000, currency: 'USD', department: 'Engineering', country: 'United States', gender: 'Female' },
        // Germany (EUR -> USD rate: 1.10)
        // EUR 50,000 = USD 55,000
        { salary: 50000, currency: 'EUR', department: 'Sales', country: 'Germany', gender: 'Female' },
        // India (INR -> USD rate: 0.012)
        // INR 1,000,000 = USD 12,000
        { salary: 1000000, currency: 'INR', department: 'Engineering', country: 'India', gender: 'Male' }
      ];

      const metrics = calculateMetrics(mockEmployees, mockExchangeRates);

      // Totals check
      // Payroll: 100k + 120k + 55k + 12k = 287k
      expect(metrics.totals.totalHeadcount).toBe(4);
      expect(metrics.totals.totalPayrollUSD).toBe(287000);
      // Avg: 287k / 4 = 71,750
      expect(metrics.totals.averageSalaryUSD).toBe(71750);
      // Median: sorted: [12k, 55k, 100k, 120k] -> median is (55k + 100k) / 2 = 77,500
      expect(metrics.totals.medianSalaryUSD).toBe(77500);

      // Department check
      const engineering = metrics.byDepartment.find(d => d.department === 'Engineering');
      expect(engineering).toBeDefined();
      expect(engineering?.headcount).toBe(3);
      // Engineering salaries: [100k, 120k, 12k] -> total: 232k -> avg: 232k / 3 = 77,333
      expect(engineering?.averageSalaryUSD).toBe(77333);

      // Country check
      const us = metrics.byCountry.find(c => c.country === 'United States');
      expect(us).toBeDefined();
      expect(us?.headcount).toBe(2);
      expect(us?.totalPayrollUSD).toBe(220000);

      // Gender Pay Gap check
      const engGap = metrics.genderGap.find(g => g.department === 'Engineering');
      expect(engGap).toBeDefined();
      // Eng Male salaries: [100k, 12k] -> avg: 56,000
      // Eng Female salaries: [120k] -> avg: 120,000
      // Gap: (MaleAvg - FemaleAvg) / MaleAvg * 100 = (56k - 120k) / 56k * 100 = -114.29%
      expect(engGap?.maleAvgUSD).toBe(56000);
      expect(engGap?.femaleAvgUSD).toBe(120000);
      expect(engGap?.gapPercentage).toBe(-114.29);
    });
  });
});
