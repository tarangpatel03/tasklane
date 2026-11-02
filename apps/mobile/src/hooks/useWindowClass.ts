import { useWindowDimensions } from 'react-native';
import { screenMargin } from '../theme';

export type WindowClass = 'compact' | 'medium' | 'expanded';

/** Width breakpoints in dp. 900 is where the split pane starts (docs/design-brief.md). */
const MEDIUM_MIN_WIDTH = 600;
const EXPANDED_MIN_WIDTH = 900;
/** Below this width the smaller 16 margin is used (brief: 16 at 320 wide). */
const NARROW_WIDTH = 360;

export interface WindowInfo {
  windowClass: WindowClass;
  isLandscape: boolean;
  /** Screen margin for this width: 16 narrow phones, 20 phones, 40 medium, 24 inside the expanded list pane. */
  margin: number;
  width: number;
  height: number;
}

/** Size class of the current window; updates on rotation, fold and split-screen. */
export function useWindowClass(): WindowInfo {
  const { width, height } = useWindowDimensions();
  let windowClass: WindowClass = 'compact';
  if (width >= EXPANDED_MIN_WIDTH) windowClass = 'expanded';
  else if (width >= MEDIUM_MIN_WIDTH) windowClass = 'medium';
  let margin: number = width < NARROW_WIDTH ? screenMargin.narrow : screenMargin.compact;
  if (windowClass === 'medium') margin = screenMargin.medium;
  else if (windowClass === 'expanded') margin = screenMargin.expanded;
  return { windowClass, isLandscape: width > height, margin, width, height };
}
