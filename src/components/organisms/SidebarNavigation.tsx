import { TrendingUp, Users } from 'lucide-react';
import styles from '@/app/page.module.css';

type ActiveTab = 'dashboard' | 'directory';

interface SidebarNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logoIcon}>A</div>
        <span className={styles.logoText}>ACME Corp</span>
      </div>

      <nav className={styles.navMenu}>
        <button
          className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <TrendingUp size={18} />
          <span>Dashboard</span>
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'directory' ? styles.navItemActive : ''}`}
          onClick={() => onTabChange('directory')}
        >
          <Users size={18} />
          <span>Employee Directory</span>
        </button>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>HR</div>
          <div className={styles.userInfo}>
            <h4>HR Manager</h4>
            <p>Acme Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
