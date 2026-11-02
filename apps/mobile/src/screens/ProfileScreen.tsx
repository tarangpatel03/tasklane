import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../auth/auth.context';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { NAV_CLEARANCE } from '../components/BottomNav';
import { ChangePasswordSheet } from '../components/ChangePasswordSheet';
import { Entrance } from '../components/Entrance';
import { useSnackbar } from '../components/Snackbar';
import { Wash } from '../components/Wash';
import { usePressScale } from '../hooks/usePressScale';
import { useWindowClass } from '../hooks/useWindowClass';
import { colors, elevation, fontFamily, radii, sizes, spacing } from '../theme';
import { ROLE_LABEL } from '../utils/taskFormat.util';

/** Widest the Profile column gets on tablets (brief: max 640). */
const COLUMN_MAX_WIDTH = 640;
const ROW_HEIGHT = 56;
const ACTION_ROW_HEIGHT = 64;

function InfoRow({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <View style={styles.infoRow}>
      <AppText variant="labelL" color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText variant="bodyL" numberOfLines={1} style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  );
}

/** Name, email and role of the signed-in user, with change password and log out. */
export function ProfileScreen(): ReactNode {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { margin } = useWindowClass();
  const snackbar = useSnackbar();
  const [sheetOpen, setSheetOpen] = useState(false);
  const changePress = usePressScale();
  const logoutPress = usePressScale();

  if (!user) return null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + NAV_CLEARANCE.navOnly }}
      >
        <View style={styles.washWrap}>
          <Wash />
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + spacing.xxl,
                paddingLeft: insets.left + margin,
                paddingRight: insets.right + margin,
              },
            ]}
          >
            <Entrance style={styles.identity}>
              <Avatar id={user.id} name={user.name} size={96} own ring ringWidth={4} />
              <AppText variant="headline" style={styles.name}>
                {user.name}
              </AppText>
              <View style={styles.rolePill}>
                <AppText variant="labelS" color={colors.primaryPressed}>
                  {ROLE_LABEL[user.role]}
                </AppText>
              </View>
            </Entrance>
          </View>
        </View>

        <View
          style={[
            styles.column,
            { paddingLeft: insets.left + margin, paddingRight: insets.right + margin },
          ]}
        >
          <Entrance index={1}>
            <View style={styles.card}>
              <InfoRow label="Name" value={user.name} />
              <View style={styles.divider} />
              <InfoRow label="Email" value={user.email} />
              <View style={styles.divider} />
              <InfoRow label="Role" value={ROLE_LABEL[user.role]} />
            </View>
          </Entrance>

          <Entrance index={2}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSheetOpen(true)}
              {...changePress.handlers}
            >
              <Animated.View style={[styles.actionRow, changePress.style]}>
                <AppText variant="bodyL" style={styles.actionLabel}>
                  Change password
                </AppText>
                <Svg width={22} height={22} viewBox="0 0 24 24">
                  <Path
                    d="M9 5l7 7-7 7"
                    fill="none"
                    stroke={colors.textSecondary}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Animated.View>
            </Pressable>
          </Entrance>

          <Entrance index={3}>
            <Pressable
              accessibilityRole="button"
              onPress={() => void logout()}
              {...logoutPress.handlers}
            >
              <Animated.View style={[styles.logout, logoutPress.style]}>
                <Svg width={22} height={22} viewBox="0 0 24 24">
                  <Path
                    d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M15 8l4 4-4 4M19 12H9"
                    fill="none"
                    stroke={colors.rejectText}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <AppText variant="bodyL" color={colors.rejectText} style={styles.actionLabel}>
                  Log out
                </AppText>
              </Animated.View>
            </Pressable>
          </Entrance>
        </View>
      </ScrollView>

      <ChangePasswordSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onChanged={() => {
          setSheetOpen(false);
          snackbar.show('Password updated');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  washWrap: {
    borderBottomLeftRadius: radii.xl + 8,
    borderBottomRightRadius: radii.xl + 8,
    overflow: 'hidden',
  },
  header: { paddingBottom: spacing.xxxl, alignItems: 'center' },
  identity: { alignItems: 'center', gap: spacing.md },
  name: { fontSize: 26, lineHeight: 32, textAlign: 'center' },
  rolePill: {
    minHeight: 24,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  column: {
    width: '100%',
    maxWidth: COLUMN_MAX_WIDTH,
    alignSelf: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.l,
    paddingHorizontal: spacing.xl,
    ...elevation.l2,
  },
  infoRow: {
    minHeight: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  infoValue: { flexShrink: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.surfaceVariant },
  actionRow: {
    minHeight: ACTION_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    borderRadius: radii.l,
    backgroundColor: colors.surface,
    ...elevation.l1,
  },
  actionLabel: { fontFamily: fontFamily.bold },
  logout: {
    minHeight: sizes.buttonPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.logoutBorder,
    backgroundColor: colors.surface,
  },
});
