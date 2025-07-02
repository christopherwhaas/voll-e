// Data models and constants for voll-e app

export type SkillLevel = 'New' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Jules';
export type TeamSize = 'Small' | 'Large' | 'Any';
export type Position = 'Hitter' | 'Setter' | 'Libero' | 'Blocker' | 'Any';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  skillLevel: SkillLevel;
  teamSizePreference?: TeamSize; // Default is 'Any'
  preferredPosition?: Position; // Default is 'Any'
  emoji?: string; // Default is random from EMOJI_LIST
}

export interface Team {
  id: string;
  name: string; // Editable, defaults to random color
  players: Player[];
}

export interface Settings {
  skillWeight: number;      // Default: 0.6
  sizeWeight: number;       // Default: 0.3
  positionWeight: number;   // Default: 0.1
  darkMode?: boolean;       // Default: false
}

export interface AppState {
  players: Player[];
  teams: Team[];
  settings: Settings;
  numberOfNets: number;
  sessionPlayerIds: string[]; // IDs of players selected for this session
}

export const SKILL_VALUES: Record<SkillLevel, number> = {
  New: 0,
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Jules: 4
};

export const COLOR_NAMES = [
  'Teal', 'Navy', 'Coral', 'Crimson', 'Olive', 'Amber', 'Slate', 'Indigo', 'Sunset', 'Butter',
];

export const COLOR_MAP: Record<string, string> = {
  Teal: '#20B2AA',
  Navy: '#001F54',
  Coral: '#FF7F50',
  Crimson: '#DC143C',
  Olive: '#808000',
  Amber: '#FFC107',
  Slate: '#708090',
  Indigo: '#4B0082',
  Sunset: '#FF5E13',
  Butter: '#FFF200',
};

export const STORAGE_KEYS = {
  PLAYERS: '@volleyteam_players',
  SETTINGS: '@volleyteam_settings',
};

export const EMOJI_LIST = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'
]; 