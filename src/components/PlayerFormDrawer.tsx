import * as React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text, Button, Portal, IconButton, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS
} from 'react-native-reanimated';
import PlayerForm, { PlayerFormValues } from './PlayerForm';
import { Player } from '../models/types';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.9; // Take up 90% of screen width

interface PlayerFormDrawerProps {
  visible: boolean;
  onDismiss: () => void;
  initialValues?: Partial<PlayerFormValues> & { id?: string };
  onSubmit: (values: PlayerFormValues) => void;
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
  onImport?: () => void;
  showImportButton?: boolean;
}

export default function PlayerFormDrawer({ 
  visible, 
  onDismiss, 
  initialValues,
  onSubmit,
  onCancel,
  title = 'Add Player',
  submitLabel = 'Add Player',
  onImport,
  showImportButton = false
}: PlayerFormDrawerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Animation values
  const translateX = useSharedValue(DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  // Initialize local state when drawer opens
  React.useEffect(() => {
    if (visible) {
      // Animate drawer in
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Animate drawer out
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const handleDismiss = () => {
    translateX.value = withTiming(DRAWER_WIDTH, { duration: 300 }, () => {
      runOnJS(onDismiss)();
    });
    overlayOpacity.value = withTiming(0, { duration: 300 });
  };

  const handleSubmit = (values: PlayerFormValues) => {
    onSubmit(values);
    handleDismiss();
  };

  const handleCancel = () => {
    onCancel();
    handleDismiss();
  };

  const handleImport = () => {
    // Dismiss drawer first, then open import modal
    onDismiss();
    // Small delay to ensure drawer is fully dismissed before opening modal
    setTimeout(() => {
      if (onImport) {
        onImport();
      }
    }, 350); // Slightly longer than animation duration
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
        <View style={[styles.drawerContent, { backgroundColor: colors.background }]}>
          {/* Header with Safe Area */}
          <View style={[
            styles.drawerHeader, 
            { 
              paddingTop: Math.max(insets.top, 20) + 20,
              paddingRight: Math.max(insets.right, 20)
            }
          ]}>
            <View style={styles.headerLeft}>
              <Text variant="titleLarge" style={[styles.drawerTitle, { color: colors.onBackground }]}>
                {title}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {showImportButton && onImport && (
                <Button
                  mode="outlined"
                  icon="account-multiple-plus"
                  onPress={handleImport}
                  style={styles.importButton}
                  textColor={colors.primary}
                  buttonColor="transparent"
                >
                  Bulk Import
                </Button>
              )}
              <IconButton
                icon="close"
                size={24}
                onPress={handleDismiss}
                style={styles.closeButton}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.drawerFormContainer, { paddingRight: Math.max(insets.right, 20), flex: 1 }]}>
            <PlayerForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              title={title}
              submitLabel={submitLabel}
              onImport={onImport}
              showImportButton={showImportButton}
              hideHeader={true}
              fullHeight={true}
            />
          </View>
        </View>
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  importButton: {
    marginRight: 8,
  },
  drawerTitle: {
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 0,
  },
  drawerFormContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
}); 