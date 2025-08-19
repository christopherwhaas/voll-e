// Data models and constants for voll-e app

export type SkillLevel = 'New' | 'Beginner' | 'Intermediate' | 'Skilled' | 'Advanced' | 'Pro' | 'Star' | 'Legend';
export type TeamSize = 'Small' | 'Large' | 'Any';

export interface Player {
  id: string;
  firstName: string;
  lastName?: string; // Optional last name
  skillLevel: SkillLevel;
  teamSizePreference?: TeamSize; // Default is 'Any'
  teammatePreference?: string; // Player id of preferred teammate
  emoji?: string; // Default is random from EMOJI_LIST
}

export interface Team {
  id: string;
  name: string; // Editable, defaults to random color
  players: Player[];
}

export interface Settings {
  weights: WeightSetings;
  darkMode?: boolean;       // Default: false
}

export interface WeightSetings {
  skillLevel: number;
  teammatePreference: number;
  teamSizePreference: number;
};

export interface AppState {
  players: Player[];
  teams: Team[];
  settings: Settings;
  numberOfNets: number;
  sessionPlayerIds: string[]; // IDs of players selected for this session
}

// Tournament Types - TEMPORARILY DISABLED
// export interface Match {
//   id: string;
//   team1Id: string;
//   team2Id: string;
//   team1Wins: number;
//   team2Wins: number;
//   isComplete: boolean;
//   winnerId?: string;
//   round: number;
//   bracket: 'winner' | 'loser' | 'final';
//   matchNumber: number; // Position in the round
//   fromWinnerMatchId?: string; // For visualization: where this team came from
//   fromLoserMatchId?: string; // For visualization: where this team came from
// }

// export interface TournamentRound {
//   roundNumber: number;
//   bracket: 'winner' | 'loser' | 'final';
//   matches: Match[];
//   isComplete: boolean;
// }

// export interface TournamentSettings {
//   doubleElimination: boolean;
//   preliminaryMatchesPerRound: number;
//   championshipMatchesPerRound: number;
// }

// export interface TournamentTeam {
//   id: string;
//   name: string;
//   players: Player[];
//   losses: number; // 0, 1, or 2 (eliminated)
// }

// export interface Tournament {
//   id: string;
//   name: string;
//   teams: TournamentTeam[];
//   settings: TournamentSettings;
//   rounds: TournamentRound[];
//   isComplete: boolean;
//   winner?: string; // Team ID of tournament winner
//   runnerUp?: string; // Team ID of tournament runner-up
// }

export const SKILL_VALUES: Record<SkillLevel, number> = {
  New: 0,
  Beginner: 1,
  Intermediate: 2,
  Skilled: 3,
  Advanced: 4,
  Pro: 5,
  Star: 6,
  Legend: 7
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
  // TOURNAMENTS: '@volleyteam_tournaments',
};

export const EMOJI_LIST = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'
]; 