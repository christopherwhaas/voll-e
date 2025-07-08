import * as React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import MainNavigator from './src/navigation/MainNavigator';
import { AppStateProvider, useAppState } from './src/models/AppStateContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomThemeColors } from './src/styles/Colors';

function ThemedApp() {
  const { settings } = useAppState();
  const paperTheme = settings.darkMode ? {
    ...MD3DarkTheme,
    colors: CustomThemeColors.dark
  } : {
    ...MD3LightTheme,
    colors: CustomThemeColors.light
  };

  const navTheme = settings.darkMode ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: CustomThemeColors.dark.background,
      primary: CustomThemeColors.dark.primary,
      card: CustomThemeColors.dark.surface,
      text: CustomThemeColors.dark.onSurface,
      border: CustomThemeColors.dark.outline,
      notification: CustomThemeColors.dark.error,
    }
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: CustomThemeColors.light.background,
      primary: CustomThemeColors.light.primary,
      card: CustomThemeColors.light.surface,
      text: CustomThemeColors.light.onSurface,
      border: CustomThemeColors.light.outline,
      notification: CustomThemeColors.light.error,
    }
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
