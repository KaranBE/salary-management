import { Briefcase, DollarSign, Globe, Percent, TrendingUp, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from '@/app/page.module.css';
import { LoadingView } from '../molecules/LoadingView';
import { KpiCard } from '../molecules/KpiCard';
import { formatCompact, formatUSD } from '@/lib/salary-management/formatters';
import type { DashboardData } from '@/lib/salary-management/types';

interface DashboardViewProps {
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;
  isMounted: boolean;
}

export function DashboardView({
  dashboardData,
  dashboardLoading,
  isMounted,
}: DashboardViewProps) {
  if (dashboardLoading) return <LoadingView />;

  return (
    <>
      <div className={styles.kpiGrid}>
        <KpiCard
          title="Headcount"
          value={dashboardData?.totals.totalHeadcount ?? 0}
          subtext="Total active employees"
          icon={<Users size={16} />}
        />

        <KpiCard
          title="Total Payroll (USD)"
          value={formatCompact(dashboardData?.totals.totalPayrollUSD || 0)}
          subtext="Annualized total payroll cost"
          icon={<DollarSign size={16} />}
          valueTitle={formatUSD(dashboardData?.totals.totalPayrollUSD || 0)}
        />

        <KpiCard
          title="Average Salary (USD)"
          value={formatCompact(dashboardData?.totals.averageSalaryUSD || 0)}
          subtext="Mean compensation cost"
          icon={<TrendingUp size={16} />}
          valueTitle={formatUSD(dashboardData?.totals.averageSalaryUSD || 0)}
        />

        <KpiCard
          title="Median Salary (USD)"
          value={formatCompact(dashboardData?.totals.medianSalaryUSD || 0)}
          subtext="Mid-point compensation cost"
          icon={<Percent size={16} />}
          valueTitle={formatUSD(dashboardData?.totals.medianSalaryUSD || 0)}
        />
      </div>

      {isMounted && (
        <div className={styles.chartsGrid}>
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
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                    formatter={(value) => [formatUSD(Number(value) || 0), 'Average Salary']}
                  />
                  <Bar dataKey="averageSalaryUSD" fill="url(#primaryGrad)" radius={[4, 4, 0, 0]} name="Avg Salary" />
                  <defs>
                    <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                    formatter={(value) => [formatUSD(Number(value) || 0), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="maleAvgUSD" fill="#3b82f6" name="Male Avg" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="femaleAvgUSD" fill="#ec4899" name="Female Avg" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                  <YAxis yAxisId="left" stroke="#818cf8" tick={{ fill: '#818cf8', fontSize: 11 }} tickFormatter={(v) => `$${v / 1000000}M`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#34d399" tick={{ fill: '#34d399', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.08)' }} />
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
  );
}
