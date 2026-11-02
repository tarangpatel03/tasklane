import { TaskStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface StatusIconProps {
  status: TaskStatus;
  color: string;
  /** Colour of the check cut into a Completed circle. */
  checkColor: string;
  size?: number;
}

/** To Do ring, Working half-filled ring, In Review ring with clock hands, Completed filled circle with check. */
export function StatusIcon({ status, color, checkColor, size = 18 }: StatusIconProps): ReactNode {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {status === TaskStatus.COMPLETED ? (
        <>
          <Circle cx={12} cy={12} r={10} fill={color} />
          <Path
            d="M7.5 12.3l3 3 6-6.6"
            fill="none"
            stroke={checkColor}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={2.4} />
          {status === TaskStatus.WORKING && <Path d="M12 3a9 9 0 0 1 0 18z" fill={color} />}
          {status === TaskStatus.IN_REVIEW && (
            <Path
              d="M12 7.5V12l3 2"
              fill="none"
              stroke={color}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </>
      )}
    </Svg>
  );
}
