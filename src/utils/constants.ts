import { Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export { screenHeight };

export const SCREEN_MARGIN = 16; 
export const SORT_OPTIONS = [
  { key: 'skill', label: 'Skill Level' },
  { key: 'teammate', label: 'Teammate Preference' },
  { key: 'size', label: 'Team Size Preference' },
];
export const DEFAULT_RANKING_PREFERENCES = ['skill', 'teammate', 'size'];