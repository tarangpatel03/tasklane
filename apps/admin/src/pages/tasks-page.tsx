import type { ReactNode } from 'react';
import { EmptyState } from '../components/empty-state';
import { PageHeader } from '../components/page-header';

/** Placeholder; 4.4 adds the task table, filters and the create and review flows. */
export function TasksPage(): ReactNode {
  return (
    <>
      <PageHeader title="Tasks" subtitle="Every task, with its Manager and Employees." />
      <EmptyState title="Nothing to show yet" message="Tasks will be listed here." />
    </>
  );
}
