import { TaskAction } from '@task-app/shared';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors, fontFamily, radii, sizes, spacing, tablet } from '../../../../../theme';
import { AppText } from '../../../../brand/AppText';
import { ActionButton } from '../../../../buttons/ActionButton';
import type { Footer } from '../../detailFooter.util';

const PANE_BAR_PADDING = 40;
const PANE_BUTTON_WIDTH = 200;

interface DetailFooterProps {
  footer: Footer;
  /** In the pane the actions sit in a bar below the content, otherwise they float over it. */
  isPane: boolean;
  busy: boolean;
  /** True while an approve is running, so only the Approve button shows a spinner. */
  approving: boolean;
  /** Left padding (window inset plus margin) and the plain margin used for the right side. */
  paddingLeft: number;
  padding: number;
  onAction: (action: TaskAction) => void;
  onReject: () => void;
}

/** The actions the viewer may take on the task, or a one-line status when there are none. */
export function DetailFooter({
  footer,
  isPane,
  busy,
  approving,
  paddingLeft,
  padding,
  onAction,
  onReject,
}: DetailFooterProps): ReactNode {
  const insets = useSafeAreaInsets();

  const footerButtons = (): ReactNode => {
    const wrap = (key: string, node: ReactNode, wide = false): ReactNode =>
      isPane ? (
        <View key={key} style={[styles.paneButton, wide && styles.paneButtonWide]}>
          {node}
        </View>
      ) : (
        node
      );
    if (footer.kind === 'actions') {
      return footer.actions.map((item) =>
        wrap(
          item.action,
          <ActionButton
            key={item.action}
            label={item.label}
            variant={item.variant}
            loading={busy}
            onPress={() => onAction(item.action)}
          />,
        ),
      );
    }
    if (footer.kind === 'review') {
      return [
        wrap(
          'reject',
          <ActionButton
            key="reject"
            label="Reject"
            variant="reject"
            disabled={busy}
            onPress={onReject}
          />,
        ),
        wrap(
          'approve',
          <ActionButton
            key="approve"
            label="Approve"
            variant="approve"
            loading={approving}
            disabled={busy}
            onPress={() => onAction(TaskAction.APPROVE)}
          />,
        ),
      ];
    }
    return wrap(
      'line',
      <View style={styles.statusLine}>
        <AppText variant="bodyL" color={colors.disabledText} style={styles.statusLineText}>
          {footer.text}
        </AppText>
      </View>,
      true,
    );
  };

  if (isPane) {
    return (
      <View style={[styles.paneBar, { paddingRight: insets.right + PANE_BAR_PADDING }]}>
        {footerButtons()}
      </View>
    );
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.footerWrap, { paddingBottom: insets.bottom + spacing.md }]}
    >
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="foot" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.background} stopOpacity={0} />
            <Stop offset="0.45" stopColor={colors.background} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#foot)" />
      </Svg>
      <View style={[styles.footerRow, { paddingLeft, paddingRight: insets.right + padding }]}>
        {footerButtons()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrap: { paddingTop: spacing.xxxl, position: 'absolute', left: 0, right: 0, bottom: 0 },
  footerRow: { flexDirection: 'row', gap: spacing.md },
  paneBar: {
    height: tablet.actionBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingLeft: PANE_BAR_PADDING,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  paneButton: { width: PANE_BUTTON_WIDTH, flexDirection: 'row' },
  paneButtonWide: { width: 2 * PANE_BUTTON_WIDTH },
  statusLine: {
    flex: 1,
    minHeight: sizes.buttonPrimary,
    borderRadius: radii.pill,
    backgroundColor: colors.disabledBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  statusLineText: { fontFamily: fontFamily.bold, textAlign: 'center' },
});
