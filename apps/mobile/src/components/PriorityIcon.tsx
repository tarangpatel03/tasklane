import { TaskPriority } from '@task-app/shared';
import type { ReactNode } from 'react';
import Svg, { Rect } from 'react-native-svg';

const FILLED: Record<TaskPriority, number> = {
  [TaskPriority.LOW]: 1,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.HIGH]: 3,
};

/** Three bars, filled 1, 2 or 3 of 3. */
export function PriorityIcon({
  priority,
  color,
  size = 14,
}: {
  priority: TaskPriority;
  color: string;
  size?: number;
}): ReactNode {
  const filled = FILLED[priority];
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      {[0, 1, 2].map((bar) => (
        <Rect
          key={bar}
          x={1 + bar * 5}
          y={10 - bar * 4}
          width={4}
          height={5 + bar * 4}
          rx={1.2}
          fill={color}
          opacity={bar < filled ? 1 : 0.3}
        />
      ))}
    </Svg>
  );
}
