import type { ReactNode } from 'react';
import { EmptyState } from '../components/empty-state';
import { PageHeader } from '../components/page-header';

/** Placeholder; 4.5 adds the status tiles, overdue list and Manager workload. */
export function DashboardPage(): ReactNode {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Task counts, overdue work and Manager workload." />
      <EmptyState
        title="Nothing to show yet"
        message="Task counts and overdue work will appear here."
      />
    </>
  );
}
