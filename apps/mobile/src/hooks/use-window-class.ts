import { useWindowDimensions } from 'react-native';

export type WindowClass = 'compact' | 'medium' | 'expanded';

/** Width breakpoints in dp. 900 is where the split pane starts (docs/design-brief.md). */
const MEDIUM_MIN_WIDTH = 600;
const EXPANDED_MIN_WIDTH = 900;

export interface WindowInfo {
  windowClass: WindowClass;
  isLandscape: boolean;
  width: number;
  height: number;
}

/** Size class of the current window; updates on rotation, fold and split-screen. */
export function useWindowClass(): WindowInfo {
  const { width, height } = useWindowDimensions();
  let windowClass: WindowClass = 'compact';
  if (width >= EXPANDED_MIN_WIDTH) windowClass = 'expanded';
  else if (width >= MEDIUM_MIN_WIDTH) windowClass = 'medium';
  return { windowClass, isLandscape: width > height, width, height };
}
