import * as React from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Text, Button, TextInput, List, useTheme, Menu } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SkillLevel, TeamSize, Position, EMOJI_LIST } from './models/types';

const skillLevels: SkillLevel[] = ['New', 'Beginner', 'Intermediate', 'Advanced', 'Jules'];
const teamSizes: TeamSize[] = ['Any', 'Small', 'Large'];
const positions: Position[] = ['Any', 'Hitter', 'Setter', 'Libero', 'Blocker'];

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  skillLevel: yup.mixed<SkillLevel>().oneOf(skillLevels).required(),
  teamSizePreference: yup.mixed<TeamSize>().oneOf(teamSizes).required(),
  preferredPosition: yup.mixed<Position>().oneOf(positions).required(),
  emoji: yup.string().oneOf(EMOJI_LIST).required(),
});

export interface PlayerFormValues {
  firstName: string;
  lastName: string;
  skillLevel: SkillLevel;
  teamSizePreference: TeamSize;
  preferredPosition: Position;
  emoji: string;
}

interface PlayerFormProps {
  initialValues?: Partial<PlayerFormValues>;
  onSubmit: (values: PlayerFormValues) => void;
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
}

export default function PlayerForm({ initialValues, onSubmit, onCancel, title = 'Add Player', submitLabel = 'Save Player' }: PlayerFormProps) {
  const { colors } = useTheme();
  const { control, handleSubmit, reset, setValue } = useForm<PlayerFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      skillLevel: 'New',
      teamSizePreference: 'Any',
      preferredPosition: 'Any',
      emoji: EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)],
      ...initialValues,
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        setValue(key as keyof PlayerFormValues, value as any);
      });
    } else {
      reset();
    }
  }, [initialValues]);

  // Dropdown menu state and width for each dropdown
  const [skillMenuVisible, setSkillMenuVisible] = React.useState(false);
  const [skillMenuWidth, setSkillMenuWidth] = React.useState(0);
  const [sizeMenuVisible, setSizeMenuVisible] = React.useState(false);
  const [sizeMenuWidth, setSizeMenuWidth] = React.useState(0);
  const [positionMenuVisible, setPositionMenuVisible] = React.useState(false);
  const [positionMenuWidth, setPositionMenuWidth] = React.useState(0);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>{title}</Text>
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
              label="Last Name"
              value={value}
              onChangeText={onChange}
              error={!!error}
              style={styles.input}
            />
          )}
        />
        {/* Skill Level Dropdown */}
        <Controller
          control={control}
          name="skillLevel"
          render={({ field: { onChange, value } }) => (
            <List.Section>
              <List.Subheader>Skill Level</List.Subheader>
              <View
                style={styles.input}
                onLayout={e => setSkillMenuWidth(e.nativeEvent.layout.width)}
              >
                <Menu
                  visible={skillMenuVisible}
                  onDismiss={() => setSkillMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setSkillMenuVisible(true)}
                      style={{ width: '100%' }}
                    >
                      {value}
                    </Button>
                  }
                  contentStyle={{ width: skillMenuWidth }}
                >
                  {skillLevels.map(level => (
                    <Menu.Item key={level} onPress={() => { onChange(level); setSkillMenuVisible(false); }} title={level} />
                  ))}
                </Menu>
              </View>
            </List.Section>
          )}
        />
        {/* Team Size Dropdown */}
        <Controller
          control={control}
          name="teamSizePreference"
          render={({ field: { onChange, value } }) => (
            <List.Section>
              <List.Subheader>Team Size Preference</List.Subheader>
              <View
                style={styles.input}
                onLayout={e => setSizeMenuWidth(e.nativeEvent.layout.width)}
              >
                <Menu
                  visible={sizeMenuVisible}
                  onDismiss={() => setSizeMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setSizeMenuVisible(true)}
                      style={{ width: '100%' }}
                    >
                      {value || 'Any'}
                    </Button>
                  }
                  contentStyle={{ width: sizeMenuWidth }}
                >
                  {teamSizes.map(size => (
                    <Menu.Item key={size} onPress={() => { onChange(size); setSizeMenuVisible(false); }} title={size} />
                  ))}
                </Menu>
              </View>
            </List.Section>
          )}
        />
        {/* Position Dropdown */}
        <Controller
          control={control}
          name="preferredPosition"
          render={({ field: { onChange, value } }) => (
            <List.Section>
              <List.Subheader>Preferred Position</List.Subheader>
              <View
                style={styles.input}
                onLayout={e => setPositionMenuWidth(e.nativeEvent.layout.width)}
              >
                <Menu
                  visible={positionMenuVisible}
                  onDismiss={() => setPositionMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setPositionMenuVisible(true)}
                      style={{ width: '100%' }}
                    >
                      {value || 'Any'}
                    </Button>
                  }
                  contentStyle={{ width: positionMenuWidth }}
                >
                  {positions.map(pos => (
                    <Menu.Item key={pos} onPress={() => { onChange(pos); setPositionMenuVisible(false); }} title={pos} />
                  ))}
                </Menu>
              </View>
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
                      borderRadius: 8,
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
        <Button mode="contained" style={{ marginTop: 12 }} onPress={handleSubmit(onSubmit)}>
          {submitLabel}
        </Button>
        <Button onPress={onCancel} style={{ marginTop: 8 }}>
          Cancel
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 12 },
}); 