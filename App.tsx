import * as React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import MainNavigator from './src/navigation/MainNavigator';
import { AppStateProvider, useAppState } from './src/models/AppStateContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function ThemedApp() {
  const { settings } = useAppState();
  const paperTheme = settings.darkMode ? MD3DarkTheme : MD3LightTheme;
  const navTheme = settings.darkMode ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: paperTheme.colors.background,
      primary: paperTheme.colors.primary,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.error,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: paperTheme.colors.background,
      primary: paperTheme.colors.primary,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.error,
    },
  };
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <MainNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStateProvider>
        <ThemedApp />
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}
