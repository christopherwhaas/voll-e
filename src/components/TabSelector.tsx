import React from 'react';
import { View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface TabOption {
  key: string;
  label: string;
  icon?: string;
}

interface TabSelectorProps {
  options: TabOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  style?: any;
}

const TabSelector: React.FC<TabSelectorProps> = ({ 
  options, 
  selectedKey, 
  onSelect, 
  style 
}) => {
  const { colors } = useTheme();

  return (
    <View style={[
      { 
        flexDirection: 'row', 
        borderRadius: 8, 
        backgroundColor: colors.surfaceVariant, 
        overflow: 'hidden',
        alignSelf: 'center'
      },
      style
    ]}>
      {options.map((option, idx) => (
        <Pressable
          key={option.key}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 18,
            backgroundColor: selectedKey === option.key ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: idx === 0 ? 8 : 0,
            borderBottomLeftRadius: idx === 0 ? 8 : 0,
            borderTopRightRadius: idx === options.length - 1 ? 8 : 0,
            borderBottomRightRadius: idx === options.length - 1 ? 8 : 0,
          }}
          onPress={() => onSelect(option.key)}
        >
          <Text style={{ 
            color: selectedKey === option.key ? colors.onPrimary : colors.onSurfaceVariant, 
            fontWeight: 'bold', 
            textAlign: 'center',
            fontSize: 15
          }}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default TabSelector; 