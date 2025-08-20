import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Portal, Modal, List, useTheme, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { sharedStyles, screenHeight } from '../styles/shared';
import TabSelector from './TabSelector';

interface SettingsModalProps {
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

export default function SettingsModal({ visible, onDismiss, settings, onSave }: SettingsModalProps) {
  const { colors } = useTheme();
  const [darkMode, setDarkMode] = React.useState(settings.darkMode ?? false);
  const [settingsSavedModalVisible, setSettingsSavedModalVisible] = React.useState(false);
  const [weights, setWeights] = React.useState(settings.weights ?? {
    skillLevel: 3,
    teammatePreference: 2,
    teamSizePreference: 1
  });

  // Initialize local state when modal opens
  React.useEffect(() => {
    if (visible) {
      setWeights(settings.weights ?? {
        skillLevel: 3,
        teammatePreference: 2,
        teamSizePreference: 1
      });
      setDarkMode(settings.darkMode ?? false);
    }
  }, [visible]);

  const handleSaveSettings = () => {
    const newSettings = { weights, darkMode };
    onSave(newSettings);
    setSettingsSavedModalVisible(true);
    setTimeout(() => setSettingsSavedModalVisible(false), 700);
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
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ maxHeight: screenHeight * 0.8 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
        <List.Section>
          <List.Subheader>App Appearance</List.Subheader>
          <View style={sharedStyles.settingRow}>
            <Text variant="bodyMedium" style={sharedStyles.settingLabel}>Dark Mode</Text>
            <TabSelector
              options={[
                { key: 'off', label: 'Off' },
                { key: 'on', label: 'On' }
              ]}
              selectedKey={darkMode ? 'on' : 'off'}
              onSelect={(key) => setDarkMode(key === 'on')}
              style={{ width: 120 }}
            />
          </View>
        </List.Section>
        <List.Section>
          <List.Subheader>Team Generation Preferences</List.Subheader>
          <Text variant="bodySmall" style={{ marginBottom: 16, opacity: 0.7 }}>
            Adjust the importance of each factor when generating balanced teams:
          </Text>
          
          <View style={sharedStyles.settingRow}>
            <Text variant="bodyMedium" style={sharedStyles.settingLabel}>Skill Level</Text>
            <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: 'bold', marginLeft: 8 }}>
              {weights.skillLevel}
            </Text>
          </View>
          <Slider
            style={{ height: 40, marginBottom: 16 }}
            minimumValue={0}
            maximumValue={5}
            step={1}
            value={weights.skillLevel}
            onValueChange={(value) => setWeights({ ...weights, skillLevel: Math.round(value) })}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceVariant}
            thumbTintColor={colors.primary}
          />

          <View style={sharedStyles.settingRow}>
            <Text variant="bodyMedium" style={sharedStyles.settingLabel}>Teammate Preference</Text>
            <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: 'bold', marginLeft: 8 }}>
              {weights.teammatePreference}
            </Text>
          </View>
          <Slider
            style={{ height: 40, marginBottom: 16 }}
            minimumValue={0}
            maximumValue={5}
            step={1}
            value={weights.teammatePreference}
            onValueChange={(value) => setWeights({ ...weights, teammatePreference: Math.round(value) })}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceVariant}
            thumbTintColor={colors.primary}
          />

          <View style={sharedStyles.settingRow}>
            <Text variant="bodyMedium" style={sharedStyles.settingLabel}>Team Size Preference</Text>
            <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: 'bold', marginLeft: 8 }}>
              {weights.teamSizePreference}
            </Text>
          </View>
          <Slider
            style={{ height: 40, marginBottom: 16 }}
            minimumValue={0}
            maximumValue={5}
            step={1}
            value={weights.teamSizePreference}
            onValueChange={(value) => setWeights({ ...weights, teamSizePreference: Math.round(value) })}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceVariant}
            thumbTintColor={colors.primary}
          />
        </List.Section>
        <Button mode="contained" onPress={handleSaveSettings} style={[{ marginTop: 16 }, sharedStyles.cardBorderRadius]} buttonColor={colors.primary} textColor={colors.onPrimary}>
          Save Settings
        </Button>
        <Button mode="outlined" onPress={onDismiss} style={[{ marginTop: 12, borderColor: colors.error }, sharedStyles.cardBorderRadius]} textColor={colors.error}>
          Cancel
        </Button>
        </ScrollView>
      </Modal>

      <Modal visible={settingsSavedModalVisible} onDismiss={() => setSettingsSavedModalVisible(false)} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
        <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 16 }}>Settings Saved!</Text>
        <Text style={{ textAlign: 'center', opacity: 0.7 }}>Your settings have been saved.</Text>
      </Modal>
    </Portal>
  );
} 