import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { SkillLevel } from '../models/types';
import { skillLevels, skillLevelEmojis } from '../utils/constants';

interface SkillLevelSliderProps {
  value: SkillLevel;
  onValueChange: (value: SkillLevel) => void;
  style?: any;
}



const SkillLevelSlider: React.FC<SkillLevelSliderProps> = ({ 
  value, 
  onValueChange, 
  style 
}) => {
  const { colors } = useTheme();

  const getSliderValue = (skillLevel: SkillLevel): number => {
    return skillLevels.indexOf(skillLevel);
  };

  const getSkillLevelFromSliderValue = (sliderValue: number): SkillLevel => {
    const index = Math.round(sliderValue);
    return skillLevels[Math.max(0, Math.min(index, skillLevels.length - 1))];
  };

  const handleSliderChange = (sliderValue: number) => {
    const skillLevel = getSkillLevelFromSliderValue(sliderValue);
    onValueChange(skillLevel);
  };

  const handleLabelPress = (skillLevel: SkillLevel) => {
    onValueChange(skillLevel);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.emojiContainer}>
        {skillLevels.map((level, index) => (
          <TouchableOpacity 
            key={level} 
            style={styles.emojiWrapper}
            onPress={() => handleLabelPress(level)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.emoji,
              value === level && styles.selectedEmoji
            ]}>
              {skillLevelEmojis[level]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={skillLevels.length - 1}
        value={getSliderValue(value)}
        onValueChange={handleSliderChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.surfaceVariant}
        thumbTintColor={colors.primary}
        step={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emojiWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    opacity: 0.5,
  },
  selectedEmoji: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  levelText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default SkillLevelSlider; 