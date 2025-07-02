import * as React from 'react';
import { View, StyleSheet, Keyboard, Pressable } from 'react-native';
import { Text, Button, Portal, Modal, Switch, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useAppState } from '../models/AppStateContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_MARGIN } from '../styles/constants';

export default function SettingsScreen() {
  const { settings, setSettings } = useAppState();
  const [skillWeight, setSkillWeight] = React.useState(settings.skillWeight);
  const [sizeWeight, setSizeWeight] = React.useState(settings.sizeWeight);
  const [positionWeight, setPositionWeight] = React.useState(settings.positionWeight);
  const [darkMode, setDarkMode] = React.useState(settings.darkMode ?? false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const { colors } = useTheme();

  // Update local state when settings are loaded from AsyncStorage
  React.useEffect(() => {
    console.log('Settings updated:', settings);
    setSkillWeight(settings.skillWeight);
    setSizeWeight(settings.sizeWeight);
    setPositionWeight(settings.positionWeight);
    setDarkMode(settings.darkMode ?? false);
  }, [settings]);

  // Optional: sum validation
  const total = skillWeight + sizeWeight + positionWeight;
  const isValid = Math.abs(total - 1) < 0.01;

  const handleSave = () => {
    const newSettings = { skillWeight, sizeWeight, positionWeight, darkMode };
    console.log('Saving settings:', newSettings);
    setSettings(newSettings);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>Team Generation Weights</Text>
          <Text>Skill Weight: {skillWeight.toFixed(2)}</Text>
          <Slider
            value={skillWeight}
            onValueChange={setSkillWeight}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            style={styles.slider}
          />
          <Text>Team Size Weight: {sizeWeight.toFixed(2)}</Text>
          <Slider
            value={sizeWeight}
            onValueChange={setSizeWeight}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            style={styles.slider}
          />
          <Text>Position Weight: {positionWeight.toFixed(2)}</Text>
          <Slider
            value={positionWeight}
            onValueChange={setPositionWeight}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            style={styles.slider}
          />
          <Text style={{ marginTop: 8, color: isValid ? 'green' : 'red' }}>
            Total: {total.toFixed(2)} {isValid ? '' : '(should sum to 1.00)'}
          </Text>
          <Text style={{ marginTop: 24, marginBottom: 8 }}>Dark Mode</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ flex: 1 }}>Enable Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
          <Button mode="contained" style={{ marginTop: 16 }} onPress={handleSave} disabled={!isValid}>
            Save
          </Button>
          <Portal>
            <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.onBackground }}>Settings Saved!</Text>
            </Modal>
          </Portal>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginHorizontal: SCREEN_MARGIN },
  slider: { marginBottom: 16 },
  modal: { padding: 20, margin: 20, alignItems: 'center' },
}); 