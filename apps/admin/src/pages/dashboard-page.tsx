import type { ReactNode } from 'react';
import { Button } from '../components/button';
import { RefreshIcon } from '../components/icons';
import { PageHeader } from '../components/page-header';
import { ManagerWorkload } from '../features/dashboard/manager-workload';
import { OverdueList } from '../features/dashboard/overdue-list';
import { RecentActivity } from '../features/dashboard/recent-activity';
import { StatusTiles } from '../features/dashboard/status-tiles';
import { useDashboardSummary } from '../features/dashboard/use-dashboard';
import styles from './dashboard-page.module.css';

/** Dashboard: status tiles, overdue work, tasks per Manager and recent activity. */
export function DashboardPage(): ReactNode {
  const summary = useDashboardSummary();
  const data = summary.data;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Task counts, overdue work and Manager workload."
        action={
          <button
            type="button"
            className={`${styles.refresh} ${summary.isFetching ? styles.spinning : ''}`}
            onClick={() => void summary.refetch()}
            aria-label="Refresh dashboard"
          >
            <RefreshIcon size={20} />
          </button>
        }
      />

      {summary.isError && !data ? (
        <div className={styles.error} role="alert">
          <p>The dashboard could not be loaded. {summary.error.message}</p>
          <Button variant="tonal" compact onClick={() => void summary.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <StatusTiles counts={data?.totals.byStatus ?? null} />
          <div className={styles.grid}>
            <div className={styles.column}>
              <OverdueList tasks={data?.overdue.tasks ?? null} count={data?.overdue.count ?? 0} />
              <ManagerWorkload rows={data?.perManager ?? null} />
            </div>
            <RecentActivity items={data?.recentActivity ?? null} />
          </div>
        </>
      )}
    </>
  );
}
