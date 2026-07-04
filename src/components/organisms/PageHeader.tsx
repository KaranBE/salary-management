import { Plus, RefreshCw } from 'lucide-react';
import styles from '@/app/page.module.css';
import { Button } from '../atoms/Button';

type ActiveTab = 'dashboard' | 'directory';

interface PageHeaderProps {
  activeTab: ActiveTab;
  onAddEmployee: () => void;
  onRefresh: () => void;
}

export function PageHeader({ activeTab, onAddEmployee, onRefresh }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInfo}>
        <h1>{activeTab === 'dashboard' ? 'Compensation Dashboard' : 'Employee Directory'}</h1>
        <p>
          {activeTab === 'dashboard'
            ? 'Organizational payroll costs, distributions, and pay equity analytics.'
            : 'Search, filter, onboard, and manage employee salary adjustments.'}
        </p>
      </div>

      <div className={styles.headerActions}>
        {activeTab === 'directory' && (
          <Button variant="primary" onClick={onAddEmployee}>
            <Plus size={16} />
            <span>Onboard Employee</span>
          </Button>
        )}
        <Button
          variant="secondary"
          iconOnly
          onClick={onRefresh}
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </Button>
      </div>
    </header>
  );
}
