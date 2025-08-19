import * as React from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Text, Button, TextInput, List, useTheme, Menu, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SkillLevel, TeamSize, EMOJI_LIST } from '../models/types';
import { useAppState } from '../models/AppStateContext';
import { sharedStyles, screenHeight } from '../styles/shared';
import TabSelector from './TabSelector';
import SkillLevelSlider from './SkillLevelSlider';
import { skillLevels, skillLevelEmojis } from '../utils/constants';

const teamSizes: TeamSize[] = ['Any', 'Small', 'Large'];

// Tab options for team size
const teamSizeOptions = teamSizes.map(size => ({ key: size, label: size }));

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().nullable(),
  skillLevel: yup.mixed<SkillLevel>().oneOf(skillLevels).required(),
  teamSizePreference: yup.mixed<TeamSize>().oneOf(teamSizes).required(),
  emoji: yup.string().oneOf(EMOJI_LIST).required(),
  teammatePreference: yup.string().defined(),
});

export interface PlayerFormValues {
  firstName: string;
  lastName?: string;
  skillLevel: SkillLevel;
  teamSizePreference: TeamSize;
  emoji: string;
  teammatePreference: string;
}

interface PlayerFormProps {
  initialValues?: Partial<PlayerFormValues> & { id?: string };
  onSubmit: (values: PlayerFormValues) => void;
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
  onImport?: () => void;
  showImportButton?: boolean;
  hideHeader?: boolean;
  fullHeight?: boolean;
}

export default function PlayerForm({ initialValues, onSubmit, onCancel, title = 'Add Player', submitLabel = 'Save Player', onImport, showImportButton = false, hideHeader = false, fullHeight = false }: PlayerFormProps) {
  const { colors } = useTheme();
  const { players } = useAppState();
  const { control, handleSubmit, reset, setValue, watch } = useForm<PlayerFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      skillLevel: 'New',
      teamSizePreference: 'Any',
      emoji: EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)],
      teammatePreference: initialValues?.teammatePreference ?? '',
      ...initialValues,
    },
  });
  const currentId = initialValues?.id ?? '';

  React.useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        setValue(key as keyof PlayerFormValues, value as any);
      });
    } else {
      reset();
    }
  }, [initialValues]);

  // Dropdown menu state and width for teammate preference
  const [teammateMenuVisible, setTeammateMenuVisible] = React.useState(false);
  const [teammateMenuWidth, setTeammateMenuWidth] = React.useState(0);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={fullHeight ? { flex: 1 } : undefined}>
      <ScrollView 
        contentContainerStyle={[{ flexGrow: 1 }, sharedStyles.modalContentStyle]} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
        style={fullHeight ? { flex: 1 } : sharedStyles.modalScrollView}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {!hideHeader && (
            <View style={sharedStyles.modalHeader}>
              <Text variant="titleLarge" style={{
                ...sharedStyles.modalTitle,
                color: colors.onBackground
              }}>{title}</Text>
              {showImportButton && onImport && (
                <Button
                  mode="outlined"
                  icon="account-multiple-plus"
                  onPress={onImport}
                  style={{ marginLeft: 8 }}
                  textColor={colors.primary}
                  buttonColor="transparent"
                >
                  Bulk Import
                </Button>
              )}
            </View>
          )}
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                label="First Name"
                value={value}
                onChangeText={onChange}
                error={!!error}
                style={styles.input}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                label="Last Name (Optional)"
                value={value}
                onChangeText={onChange}
                error={!!error}
                style={styles.input}
                placeholder="Enter last name (optional)"
              />
            )}
          />
          {/* Skill Level Slider */}
          <Controller
            control={control}
            name="skillLevel"
            render={({ field: { onChange, value } }) => (
              <List.Section>
                <List.Subheader>Skill Level</List.Subheader>
                <SkillLevelSlider
                  value={value}
                  onValueChange={onChange}
                  style={styles.tabSelector}
                />
              </List.Section>
            )}
          />
          {/* Team Size Preference Tab Selector */}
          <Controller
            control={control}
            name="teamSizePreference"
            render={({ field: { onChange, value } }) => (
              <List.Section>
                <List.Subheader>Team Size Preference</List.Subheader>
                <TabSelector
                  options={teamSizeOptions}
                  selectedKey={value}
                  onSelect={onChange}
                  style={styles.tabSelector}
                />
              </List.Section>
            )}
          />
          {/* Emoji Picker */}
          <Controller
            control={control}
            name="emoji"
            render={({ field: { onChange, value } }) => (
              <List.Section>
                <List.Subheader>Emoji</List.Subheader>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {EMOJI_LIST.map(emoji => (
                    <TouchableOpacity
                      key={emoji}
                      style={{
                        padding: 8,
                        margin: 4,
                        ...sharedStyles.cardBorderRadius,
                        backgroundColor: value === emoji ? colors.primary : 'transparent',
                      }}
                      onPress={() => onChange(emoji)}
                    >
                      <Text style={{ fontSize: 24 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </List.Section>
            )}
          />
          {/* Teammate Preference Dropdown */}
          <Controller
            control={control}
            name="teammatePreference"
            render={({ field: { onChange, value } }) => (
              <List.Section>
                <List.Subheader>Teammate Preference</List.Subheader>
                <View
                  style={styles.input}
                  onLayout={e => setTeammateMenuWidth(e.nativeEvent.layout.width)}
                >
                  <Menu
                    visible={teammateMenuVisible}
                    onDismiss={() => setTeammateMenuVisible(false)}
                    anchor={
                      <Button
                        mode="outlined"
                        onPress={() => setTeammateMenuVisible(true)}
                        style={[{ width: '100%' }, sharedStyles.cardBorderRadius]}
                        textColor={colors.secondary}
                      >
                        {value
                          ? (() => {
                              const teammate = players.find(p => p.id === value);
                              return teammate ? `${teammate.emoji || ''} ${teammate.firstName}${teammate.lastName ? ` ${teammate.lastName}` : ''}` : 'None';
                            })()
                          : 'None'}
                      </Button>
                    }
                    contentStyle={{ width: teammateMenuWidth }}
                  >
                    <Menu.Item onPress={() => { onChange(''); setTeammateMenuVisible(false); }} title="None" />
                    {players
                      .filter(p => !currentId || p.id !== currentId)
                      .map(p => (
                        <Menu.Item
                          key={p.id}
                          onPress={() => { onChange(p.id); setTeammateMenuVisible(false); }}
                          title={`${p.emoji || ''} ${p.firstName}${p.lastName ? ` ${p.lastName}` : ''}`}
                        />
                      ))}
                  </Menu>
                </View>
              </List.Section>
            )}
          />
          <Button mode="contained" style={[{ marginTop: 12 }, sharedStyles.cardBorderRadius]} onPress={handleSubmit(onSubmit)} buttonColor={colors.primary} textColor={colors.onPrimary}>
            {submitLabel}
          </Button>
          <Button onPress={onCancel} style={[{ marginTop: 8, borderColor: colors.error }, sharedStyles.cardBorderRadius]} textColor={colors.error}>
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...sharedStyles.cardBorderRadius,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 0,
  },
  input: { marginBottom: 12 },
  tabSelector: { marginBottom: 12 },
}); 