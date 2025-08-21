import * as React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { Group } from '../models/types';
import { useAppState } from '../models/AppStateContext';
import MultiSelectTabs from './MultiSelectTabs';

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupIds: string[];
  onSelectGroup: (groupId: string) => void;
  onAddGroup?: () => void;
  style?: any;
  multiSelect?: boolean;
  inverseColors?: boolean;
}

export default function GroupSelector({ 
  groups, 
  selectedGroupIds, 
  onSelectGroup, 
  onAddGroup,
  style,
  multiSelect = false,
  inverseColors = false
}: GroupSelectorProps) {
  const { colors } = useTheme();
  const { getAllGroups } = useAppState();
  const allGroups = getAllGroups();

  const groupItems = allGroups.map(group => ({
    id: group.id,
    label: group.name,
  }));

  return (
    <View style={[styles.container, style]}>
      <MultiSelectTabs
        items={groupItems}
        selectedIds={selectedGroupIds}
        onToggleItem={onSelectGroup}
        horizontal={true}
        style={style}
        fontSize={16}
        fontWeight="bold"
        checkmarkSize={10}
        paddingHorizontal={16}
        paddingVertical={10}
        borderRadius={24}
        gap={8}
        showAddButton={!!onAddGroup}
        onAddPress={onAddGroup}
        noCheckboxIds={['all']}
        inverseColors={inverseColors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  groupTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGroupTab: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 48,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  addIcon: {
    margin: 0,
  },
  selectionIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  selectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 