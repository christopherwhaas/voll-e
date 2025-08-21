import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Group, Player } from '../models/types';
import { useAppState } from '../models/AppStateContext';
import { sharedStyles } from '../styles/shared';
import MultiSelectTabs from './MultiSelectTabs';

const schema = yup.object({
  name: yup.string().required('Group name is required'),
  playerIds: yup.array().of(yup.string().required()).required(),
});

export interface GroupFormValues {
  name: string;
  playerIds: string[];
}

interface GroupFormProps {
  initialValues?: Partial<GroupFormValues> & { id?: string };
  onSubmit: (values: GroupFormValues) => void;
  onCancel: () => void;
  title?: string;
  submitLabel?: string;
  players: Player[];
  hideHeader?: boolean;
}

export default function GroupForm({ 
  initialValues, 
  onSubmit, 
  onCancel, 
  title = 'Add Group', 
  submitLabel = 'Save Group',
  players,
  hideHeader = false 
}: GroupFormProps) {
  const { colors } = useTheme();
  const { groups } = useAppState();
  
  // Helper function to get player's current groups
  const getPlayerGroups = (playerId: string) => {
    return groups.filter(group => group.playerIds.includes(playerId));
  };
  const { control, handleSubmit, reset, setValue, watch } = useForm<GroupFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      playerIds: [],
      ...initialValues,
    },
  });

  const selectedPlayerIds = watch('playerIds');

  React.useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        setValue(key as keyof GroupFormValues, value as any);
      });
    } else {
      reset();
    }
  }, [initialValues, setValue, reset]);

  const handleTogglePlayer = (playerId: string) => {
    const currentIds = selectedPlayerIds || [];
    const newIds = currentIds.includes(playerId)
      ? currentIds.filter(id => id !== playerId)
      : [...currentIds, playerId];
    setValue('playerIds', newIds);
  };

  const handleSelectAll = () => {
    setValue('playerIds', players.map(p => p.id));
  };

  const handleUnselectAll = () => {
    setValue('playerIds', []);
  };

  return (
    <ScrollView 
      contentContainerStyle={sharedStyles.modalContentStyle} 
      keyboardShouldPersistTaps="handled" 
      showsVerticalScrollIndicator={false}
      style={sharedStyles.modalScrollView}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {!hideHeader && (
          <View style={sharedStyles.modalHeader}>
            <Text variant="titleLarge" style={{
              ...sharedStyles.modalTitle,
              color: colors.onBackground
            }}>{title}</Text>
          </View>
        )}
        
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label="Group Name"
              value={value}
              onChangeText={onChange}
              error={!!error}
              style={styles.input}
            />
          )}
        />

        <View style={styles.playersSection}>
          <View style={styles.playersHeader}>
            <Text variant="titleMedium" style={{ color: colors.onBackground }}>
              Players in Group ({selectedPlayerIds?.length || 0})
            </Text>
            <View style={styles.selectAllContainer}>
              <Button 
                mode="text" 
                onPress={handleSelectAll}
                textColor={colors.primary}
                compact
              >
                Select All
              </Button>
              <Button 
                mode="text" 
                onPress={handleUnselectAll}
                textColor={colors.error}
                compact
              >
                Clear
              </Button>
            </View>
          </View>

          <MultiSelectTabs
            items={players.map(player => ({
              id: player.id,
              label: `${player.firstName}${player.lastName ? ` ${player.lastName}` : ''}`,
              emoji: player.emoji || '👤'
            }))}
            selectedIds={selectedPlayerIds || []}
            onToggleItem={handleTogglePlayer}
            style={{ marginTop: 8 }}
            fontSize={12}
            fontWeight="500"
            paddingHorizontal={2}
            paddingVertical={8}
            borderRadius={20}
            emojiSize={14}
            checkmarkSize={8}
            gap={4}
          />
        </View>

        <Button 
          mode="contained" 
          style={[{ marginTop: 12 }, sharedStyles.cardBorderRadius]} 
          onPress={handleSubmit(onSubmit)} 
          buttonColor={colors.primary} 
          textColor={colors.onPrimary}
        >
          {submitLabel}
        </Button>
        <Button 
          onPress={onCancel} 
          style={[{ marginTop: 8, borderColor: colors.error }, sharedStyles.cardBorderRadius]} 
          textColor={colors.error}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...sharedStyles.cardBorderRadius,
  },
  input: { 
    marginBottom: 16 
  },
  playersSection: {
    marginBottom: 16,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectAllContainer: {
    flexDirection: 'row',
    gap: 8,
  },
}); 