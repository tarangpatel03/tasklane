import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getDashboardSummary, type DashboardSummary } from '../../api/dashboard.api';

/** Always refetches on mount: the numbers change whenever Managers and Employees work. */
export function useDashboardSummary(): UseQueryResult<DashboardSummary> {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
    staleTime: 0,
  });
}
