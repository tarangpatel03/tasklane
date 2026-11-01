import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { EmptyState } from './empty-state';

interface ErrorBoundaryState {
  failed: boolean;
}

/**
 * Safety net for rendering crashes: shows a message and a way back instead of a dead screen.
 * It has to be a class, because React only supports error boundaries as classes. Failed loads are
 * handled on each screen and never reach it.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.root}>
        <EmptyState
          title="Something went wrong"
          message="The app hit a problem. You can try again."
          actionLabel="Try again"
          onAction={() => this.setState({ failed: false })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', backgroundColor: colors.background },
});
