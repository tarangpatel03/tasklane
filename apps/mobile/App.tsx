import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './src/auth/auth-context';
import { AuthProvider } from './src/auth/auth-provider';
import { loadTokens } from './src/auth/token-store';
import { RootNavigator } from './src/navigation/root-navigator';
import { colors } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.primary },
};

/** Waits for the stored session check, so a signed-in user never sees the login screen flash. */
function Navigation(): ReactNode {
  const { status } = useAuth();
  if (status === 'loading') return null;

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

function App(): ReactNode {
  const [ready, setReady] = useState(false);

  // The stored refresh token must be read before the first API request.
  useEffect(() => {
    void loadTokens().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
