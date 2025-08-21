import * as React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface MultiSelectTabsProps {
  items: Array<{
    id: string;
    label: string;
    emoji?: string;
  }>;
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onSelectAll?: () => void;
  onUnselectAll?: () => void;
  showSelectAll?: boolean;
  style?: any;
  horizontal?: boolean;
  // Add button options
  showAddButton?: boolean;
  onAddPress?: () => void;
  addButtonLabel?: string;
  addButtonEmoji?: string;
  // Items that should not show checkboxes
  noCheckboxIds?: string[];
  // Color scheme options
  inverseColors?: boolean;
  // Customizable styling options
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  paddingHorizontal?: number;
  paddingVertical?: number;
  borderRadius?: number;
  emojiSize?: number;
  checkmarkSize?: number;
  gap?: number;
}

export default function MultiSelectTabs({ 
  items, 
  selectedIds, 
  onToggleItem, 
  onSelectAll, 
  onUnselectAll, 
  showSelectAll = false,
  style,
  horizontal = false,
  // Add button options
  showAddButton = false,
  onAddPress,
  addButtonLabel = 'Add',
  addButtonEmoji = '➕',
  // Items that should not show checkboxes
  noCheckboxIds = [],
  // Color scheme options
  inverseColors = false,
  // Customizable styling with defaults
  fontSize = 12,
  fontWeight = '500',
  paddingHorizontal = 6,
  paddingVertical = 8,
  borderRadius = 20,
  emojiSize = 20,
  checkmarkSize = 8,
  gap = 4
}: MultiSelectTabsProps) {
  const { colors } = useTheme();

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  if (horizontal) {
    return (
      <View style={[styles.container, style]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { gap }]}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tab,
                { 
                  backgroundColor: selectedIds.includes(item.id) 
                    ? (inverseColors ? colors.primaryContainer : colors.primary)
                    : (inverseColors ? colors.primary : colors.surface),
                  borderColor: inverseColors ? colors.onPrimary : colors.outline,
                  paddingHorizontal,
                  paddingVertical,
                  borderRadius
                }
              ]}
              onPress={() => onToggleItem(item.id)}
            >
              <Text 
                style={[
                  styles.tabText,
                  { 
                    color: selectedIds.includes(item.id) 
                      ? (inverseColors ? colors.onPrimaryContainer : colors.onPrimary)
                      : (inverseColors ? colors.onPrimary : colors.onSurface),
                    fontSize,
                    fontWeight,
                    paddingLeft: item.label === "All" ? 0 : checkmarkSize
                  }
                ]}
              >
                {item.emoji && <Text style={{ fontSize: emojiSize }}>{item.emoji} </Text>}
                {item.label}
              </Text>
              {!noCheckboxIds.includes(item.id) && (
                <View style={[styles.checkmarkContainer, { width: checkmarkSize }]}>
                  {selectedIds.includes(item.id) && (
                    <Text style={[styles.selectionCheckmark, { 
                      color: inverseColors ? colors.onPrimaryContainer : colors.onPrimary, 
                      fontSize: checkmarkSize 
                    }]}>✓</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          {/* Add Button */}
          {showAddButton && onAddPress && (
            <TouchableOpacity
              style={[
                styles.addButton,
                { 
                  backgroundColor: inverseColors ? colors.primary : colors.surface,
                  borderColor: inverseColors ? colors.onPrimary : colors.outline,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius
                }
              ]}
              onPress={onAddPress}
            >
              <Text 
                style={[
                  styles.addButtonText,
                  { 
                    color: inverseColors ? colors.onPrimary : colors.primary,
                    fontSize: 20,
                    fontWeight: 'bold'
                  }
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showSelectAll && onSelectAll && onUnselectAll && (
        <TouchableOpacity
          style={styles.selectAllContainer}
          onPress={allSelected ? onUnselectAll : onSelectAll}
        >
          <Text style={[styles.selectAllText, { color: colors.onSurfaceVariant }]}>
            {allSelected ? 'Unselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={[styles.gridContainer, { gap }]}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tab,
              { 
                backgroundColor: selectedIds.includes(item.id) 
                  ? (inverseColors ? colors.primaryContainer : colors.primary)
                  : (inverseColors ? colors.primary : colors.surface),
                borderColor: inverseColors ? colors.onPrimary : colors.outline,
                paddingHorizontal,
                paddingVertical,
                borderRadius
              }
            ]}
            onPress={() => onToggleItem(item.id)}
          >
            {item.emoji && <Text style={{ fontSize: emojiSize, marginRight: 4, paddingLeft: item.label === "All" ? 0 : checkmarkSize }}>{item.emoji}</Text>}
            <Text 
              style={[
                styles.tabText,
                { 
                  color: selectedIds.includes(item.id) 
                    ? (inverseColors ? colors.onPrimaryContainer : colors.onPrimary)
                    : (inverseColors ? colors.onPrimary : colors.onSurface),
                  fontSize,
                  fontWeight
                }
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {!noCheckboxIds.includes(item.id) && (
              <View style={[styles.checkmarkContainer, { width: checkmarkSize, marginRight: 4 }]}>
                {selectedIds.includes(item.id) && (
                  <Text style={[styles.selectionCheckmark, { 
                  color: inverseColors ? colors.onPrimaryContainer : colors.onPrimary, 
                  fontSize: checkmarkSize 
                }]}>✓</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        {/* Add Button */}
        {showAddButton && onAddPress && (
          <TouchableOpacity
                          style={[
                styles.addButton,
                { 
                  backgroundColor: inverseColors ? colors.primary : colors.surface,
                  borderColor: inverseColors ? colors.onPrimary : colors.outline,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius
                }
              ]}
            onPress={onAddPress}
          >
            <Text 
                              style={[
                  styles.addButtonText,
                  { 
                    color: inverseColors ? colors.onPrimary : colors.primary,
                    fontSize: 20,
                    fontWeight: 'bold'
                  }
                ]}
            >
              +
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    justifyContent: 'flex-start',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    maxWidth: '100%',
  },
  tabText: {
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmarkContainer: {
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCheckmark: {
    fontWeight: 'bold',
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: 14,
    marginLeft: 8,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
    borderWidth: 1,
  },
  addButtonText: {
    textAlign: 'center',
    lineHeight: 20,
  },
}); 