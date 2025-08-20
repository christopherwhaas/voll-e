import * as React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { Group } from '../models/types';
import { useAppState } from '../models/AppStateContext';

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupIds: string[];
  onSelectGroup: (groupId: string) => void;
  onAddGroup?: () => void;
  style?: any;
  multiSelect?: boolean;
}

export default function GroupSelector({ 
  groups, 
  selectedGroupIds, 
  onSelectGroup, 
  onAddGroup,
  style,
  multiSelect = false
}: GroupSelectorProps) {
  const { colors } = useTheme();
  const { getAllGroups } = useAppState();
  const allGroups = getAllGroups();

  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.groupTab,
              { 
                backgroundColor: selectedGroupIds.includes(group.id) ? colors.primary : colors.surface,
                borderColor: colors.outline
              }
            ]}
            onPress={() => onSelectGroup(group.id)}
          >
            <Text 
              style={[
                styles.groupText,
                { 
                  color: selectedGroupIds.includes(group.id) ? colors.onPrimary : colors.onSurface 
                }
              ]}
            >
              {group.name}
              {selectedGroupIds.includes(group.id) && selectedGroupIds.length > 1 && (
                <Text style={{ fontSize: 10, opacity: 0.8 }}> ✓</Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Add Group Button */}
        {onAddGroup && (
          <TouchableOpacity
            style={[
              styles.addGroupTab,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.outline
              }
            ]}
            onPress={onAddGroup}
          >
            <IconButton
              icon="plus"
              size={20}
              iconColor={colors.primary}
              style={styles.addIcon}
            />
          </TouchableOpacity>
        )}
      </ScrollView>
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