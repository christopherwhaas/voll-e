import { Dimensions } from 'react-native';
import { SkillLevel } from '../models/types';

const { height: screenHeight } = Dimensions.get('window');

export { screenHeight };

export const SCREEN_MARGIN = 16; 
export const SORT_OPTIONS = [
  { key: 'skill', label: 'Skill Level' },
  { key: 'teammate', label: 'Teammate Preference' },
  { key: 'size', label: 'Team Size Preference' },
];
export const DEFAULT_RANKING_PREFERENCES = ['skill', 'teammate', 'size'];

export const skillLevels: SkillLevel[] = ['New', 'Beginner', 'Intermediate', 'Skilled', 'Advanced', 'Pro', 'Star', 'Legend'];

// Emoji mapping for skill levels
export const skillLevelEmojis: Record<SkillLevel, string> = {
  'New': '👶',
  'Beginner': '🌱',
  'Intermediate': '👍',
  'Skilled': '👌',
  'Advanced': '🔥',
  'Pro': '💸',
  'Star': '⭐️',
  'Legend': '👑'
};