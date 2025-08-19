import * as React from 'react';
import { View, StyleSheet, Keyboard, Pressable, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Text, Button, Portal, Modal, List, Switch, useTheme, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { SORT_OPTIONS } from '../utils/constants';
import { sharedStyles, screenHeight } from '../styles/shared';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.85;

interface SettingsDrawerProps {
  visible: boolean;
  onDismiss: () => void;
  settings: {
    weights: {
      skillLevel: number;
      teammatePreference: number;
      teamSizePreference: number;
    };
    darkMode: boolean;
  };
  onSave: (settings: { weights: { skillLevel: number; teammatePreference: number; teamSizePreference: number }; darkMode: boolean }) => void;
}

export default function SettingsDrawer({ visible, onDismiss, settings, onSave }: SettingsDrawerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = React.useState(settings.darkMode ?? false);

  const [weights, setWeights] = React.useState(settings.weights ?? {
    skillLevel: 5,
    teammatePreference: 0,
    teamSizePreference: 0
  });

  // Animation values
  const translateX = useSharedValue(DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  // Initialize local state when drawer opens
  React.useEffect(() => {
    if (visible) {
      setWeights(settings.weights ?? {
        skillLevel: 5,
        teammatePreference: 0,
        teamSizePreference: 0
      });
      setDarkMode(settings.darkMode ?? false);
      
      // Animate drawer in
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Animate drawer out
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const handleSaveSettings = () => {
    const newSettings = { weights, darkMode };
    onSave(newSettings);
    handleDismiss();
  };

  const handleDismiss = () => {
    translateX.value = withTiming(DRAWER_WIDTH, { duration: 300 }, () => {
      runOnJS(onDismiss)();
    });
    overlayOpacity.value = withTiming(0, { duration: 300 });
  };

  const drawerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Portal>
      {/* Overlay */}
      <Animated.View 
        style={[
          styles.overlay,
          overlayAnimatedStyle
        ]}
      >
        <Pressable 
          style={styles.overlayPressable} 
          onPress={handleDismiss}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, drawerAnimatedStyle]}>
        <SafeAreaView style={[styles.drawerContent, { backgroundColor: colors.background }]} edges={['top', 'right']}>
          {/* Header */}
          <View style={[styles.drawerHeader, { paddingTop: insets.top > 0 ? 0 : 20 }]}>
            <Text variant="titleLarge" style={[styles.drawerTitle, { color: colors.onBackground }]}>
              Settings
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={handleDismiss}
              style={styles.closeButton}
            />
          </View>

          {/* Content */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            style={styles.drawerScrollView}
            contentContainerStyle={styles.drawerScrollContent}
          >
            <List.Section style={{ marginBottom: 24 }}>
              <List.Subheader style={{ paddingHorizontal: 0, marginBottom: 16 }}>App Appearance</List.Subheader>
              <View style={[sharedStyles.settingRow, { marginBottom: 16 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>☀️</Text>
                    <Text style={{ fontSize: 12, opacity: 0.6, marginRight: 8 }}>Light</Text>
                    <TouchableOpacity
                  style={[
                    styles.themeToggle,
                    { 
                      backgroundColor: darkMode ? colors.primary : colors.surfaceVariant,
                      justifyContent: darkMode ? 'flex-end' : 'flex-start'
                    }
                  ]}
                  onPress={() => {
                    const newDarkMode = !darkMode;
                    setDarkMode(newDarkMode);
                    // Immediately save and apply the theme change
                    const newSettings = { weights, darkMode: newDarkMode };
                    onSave(newSettings);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.themeToggleThumb,
                    { backgroundColor: colors.surface }
                  ]} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                  <Text style={{ fontSize: 12, opacity: 0.6, marginRight: 8 }}>Dark</Text>
                  <Text style={{ fontSize: 16 }}>🌙</Text>
                </View>
                  </View>
                </View>
                
              </View>
            </List.Section>
            <List.Section style={{ marginBottom: 24 }}>
              <View style={{ 
                backgroundColor: colors.surfaceVariant, 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary
              }}>
                <Text variant="bodySmall" style={{ 
                  color: colors.onSurfaceVariant, 
                  lineHeight: 20,
                  fontStyle: 'italic'
                }}>
                  ⚠️ This feature is coming in a future release. For now, team generation only accounts for skill level distributions.
                </Text>
              </View>
              
              <View style={[sharedStyles.settingRow, { marginBottom: 12, opacity: 0.5 }]}>
                <Text variant="bodyMedium" style={[sharedStyles.settingLabel, { color: colors.onSurfaceVariant }]}>Skill Level</Text>
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, fontWeight: 'bold', marginLeft: 8 }}>
                  {weights.skillLevel}
                </Text>
              </View>
              <View style={{ height: 40, marginBottom: 24, justifyContent: 'center' }}>
                <View style={{ 
                  height: 4, 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 2,
                  position: 'relative'
                }}>
                  <View style={{ 
                    height: 4, 
                    width: `${(weights.skillLevel / 5) * 100}%`, 
                    backgroundColor: colors.onSurfaceVariant, 
                    borderRadius: 2 
                  }} />
                  <View style={{ 
                    position: 'absolute',
                    left: `${(weights.skillLevel / 5) * 100}%`,
                    top: -6,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: colors.onSurfaceVariant,
                    transform: [{ translateX: -8 }]
                  }} />
                </View>
              </View>

              <View style={[sharedStyles.settingRow, { marginBottom: 12, opacity: 0.5 }]}>
                <Text variant="bodyMedium" style={[sharedStyles.settingLabel, { color: colors.onSurfaceVariant }]}>Teammate Preference</Text>
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, fontWeight: 'bold', marginLeft: 8 }}>
                  {weights.teammatePreference}
                </Text>
              </View>
              <View style={{ height: 40, marginBottom: 24, justifyContent: 'center' }}>
                <View style={{ 
                  height: 4, 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 2,
                  position: 'relative'
                }}>
                  <View style={{ 
                    height: 4, 
                    width: `${(weights.teammatePreference / 5) * 100}%`, 
                    backgroundColor: colors.onSurfaceVariant, 
                    borderRadius: 2 
                  }} />
                  <View style={{ 
                    position: 'absolute',
                    left: `${(weights.teammatePreference / 5) * 100}%`,
                    top: -6,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: colors.onSurfaceVariant,
                    transform: [{ translateX: -8 }]
                  }} />
                </View>
              </View>

              <View style={[sharedStyles.settingRow, { marginBottom: 12, opacity: 0.5 }]}>
                <Text variant="bodyMedium" style={[sharedStyles.settingLabel, { color: colors.onSurfaceVariant }]}>Team Size Preference</Text>
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, fontWeight: 'bold', marginLeft: 8 }}>
                  {weights.teamSizePreference}
                </Text>
              </View>
              <View style={{ height: 40, marginBottom: 24, justifyContent: 'center' }}>
                <View style={{ 
                  height: 4, 
                  backgroundColor: colors.surfaceVariant, 
                  borderRadius: 2,
                  position: 'relative'
                }}>
                  <View style={{ 
                    height: 4, 
                    width: `${(weights.teamSizePreference / 5) * 100}%`, 
                    backgroundColor: colors.onSurfaceVariant, 
                    borderRadius: 2 
                  }} />
                  <View style={{ 
                    position: 'absolute',
                    left: `${(weights.teamSizePreference / 5) * 100}%`,
                    top: -6,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: colors.onSurfaceVariant,
                    transform: [{ translateX: -8 }]
                  }} />
                </View>
              </View>
            </List.Section>

            <Button 
              mode="contained" 
              onPress={handleSaveSettings} 
              style={[{ marginTop: 32, marginBottom: 16 }, sharedStyles.cardBorderRadius]} 
              buttonColor={colors.primary} 
              textColor={colors.onPrimary}
            >
              Save Settings
            </Button>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>


    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 1001,
  },
  drawerContent: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  drawerTitle: {
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 0,
  },
  drawerScrollView: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  themeToggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
}); 