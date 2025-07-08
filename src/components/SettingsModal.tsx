import * as React from 'react';
import { View, StyleSheet, Keyboard, Pressable, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Modal, List, Switch, useTheme, IconButton } from 'react-native-paper';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { SORT_OPTIONS } from '../utils/constants';
import { sharedStyles } from '../styles/shared';

interface SettingsModalProps {
  visible: boolean;
  onDismiss: () => void;
  settings: {
    sortingPreferences: string[];
    darkMode: boolean;
  };
  onSave: (settings: { sortingPreferences: string[]; darkMode: boolean }) => void;
}

export default function SettingsModal({ visible, onDismiss, settings, onSave }: SettingsModalProps) {
  const { colors } = useTheme();
  const [sortingPreferences, setSortingPreferences] = React.useState<string[]>(settings.sortingPreferences);
  const [darkMode, setDarkMode] = React.useState(settings.darkMode);
  const [settingsSavedModalVisible, setSettingsSavedModalVisible] = React.useState(false);

  // Initialize local state when modal opens
  React.useEffect(() => {
    if (visible) {
      setSortingPreferences(settings.sortingPreferences);
      setDarkMode(settings.darkMode);
    }
  }, [visible]);

  const handleSaveSettings = () => {
    const newSettings = { sortingPreferences, darkMode };
    onSave(newSettings);
    setSettingsSavedModalVisible(true);
    setTimeout(() => setSettingsSavedModalVisible(false), 700);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
  };

  const renderSettingsItem = ({ item, drag, isActive }: { item: string; drag: () => void; isActive: boolean }) => {
    const option = SORT_OPTIONS.find(o => o.key === item);
    return (
      <Pressable
        onLongPress={drag}
        style={{
          padding: 16,
          backgroundColor: isActive ? colors.primary + '22' : colors.surface,
          ...sharedStyles.cardBorderRadius,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16 }}>{option?.label}</Text>
      </Pressable>
    );
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
        <View style={sharedStyles.modalHeader}>
          <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Settings</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
            style={sharedStyles.closeButton}
          />
        </View>
        <List.Section>
          <List.Subheader>Team Generation Preferences</List.Subheader>
          <Text variant="bodySmall" style={{ marginBottom: 16, opacity: 0.7 }}>
            Drag to reorder how players are prioritized when generating balanced teams:
          </Text>
          <DraggableFlatList
            data={sortingPreferences}
            keyExtractor={(item) => item}
            onDragEnd={({ data }) => setSortingPreferences(data)}
            renderItem={({ item, drag, isActive }) => (
              <TouchableOpacity
                onLongPress={drag}
                style={{
                  padding: 16,
                  backgroundColor: isActive ? colors.primary + '22' : colors.surface,
                  ...sharedStyles.cardBorderRadius,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ flex: 1, color: colors.onSurface }}>{item}</Text>
                <IconButton icon="drag" size={20} />
              </TouchableOpacity>
            )}
          />
        </List.Section>
        <List.Section>
          <View style={sharedStyles.settingRow}>
            <Text variant="bodyMedium" style={sharedStyles.settingLabel}>Dark Mode</Text>
            {darkMode ? (
              <Button
                mode="contained"
                onPress={() => setDarkMode(false)}
                icon="weather-night"
                buttonColor={colors.primary}
                textColor={colors.onPrimary}
              >
                On
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setDarkMode(true)}
                icon="weather-sunny"
                style={{ borderColor: colors.secondary }}
                textColor={colors.secondary}
              >
                Off
              </Button>
            )}
          </View>
        </List.Section>
        <Button mode="contained" onPress={handleSaveSettings} style={[{ marginTop: 16 }, sharedStyles.cardBorderRadius]} buttonColor={colors.primary} textColor={colors.onPrimary}>
          Save Settings
        </Button>
        <Button mode="outlined" onPress={onDismiss} style={[{ marginTop: 12, borderColor: colors.error }, sharedStyles.cardBorderRadius]} textColor={colors.error}>
          Cancel
        </Button>
      </Modal>

      <Modal visible={settingsSavedModalVisible} onDismiss={() => setSettingsSavedModalVisible(false)} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
        <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 16 }}>Settings Saved!</Text>
        <Text style={{ textAlign: 'center', opacity: 0.7 }}>Your settings have been saved.</Text>
      </Modal>
    </Portal>
  );
} 