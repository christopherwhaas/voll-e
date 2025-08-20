import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player, Team, Settings, AppState, STORAGE_KEYS, Group } from './types';

interface AppStateContextProps extends AppState {
  setPlayers: (players: Player[]) => void;
  setTeams: (teams: Team[]) => void;
  setSettings: (settings: Settings) => void;
  setNumberOfTeams: (numTeams: number) => void;
  setSessionPlayerIds: (ids: string[]) => void;
  setGroups: (groups: Group[]) => void;
  getAllGroups: () => Group[];
  // tournaments: Tournament[];
  // setTournaments: (tournaments: Tournament[]) => void;
  loadAppState: () => Promise<void>;
}

const defaultSettings: Settings = {
  weights: {
    skillLevel: 5,
    teammatePreference: 0,
    teamSizePreference: 0
  },
};

// Virtual "All" group that includes all players (not stored in AsyncStorage)
const createVirtualAllGroup = (players: Player[]): Group => ({
  id: 'all',
  name: 'All',
  playerIds: players.map(p => p.id)
});

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [numberOfTeams, setNumberOfTeams] = useState<number>(1);
  const [sessionPlayerIds, setSessionPlayerIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  // const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage on mount
  const loadAppState = async () => {
    try {
      const playersJson = await AsyncStorage.getItem(STORAGE_KEYS.PLAYERS);
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const groupsJson = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      // const tournamentsJson = await AsyncStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      console.log('Loading from AsyncStorage - settingsJson:', settingsJson);
      if (playersJson) {
        setPlayers(JSON.parse(playersJson));
      }
      if (settingsJson) {
        const parsedSettings = JSON.parse(settingsJson);
        console.log('Parsed settings:', parsedSettings);
        setSettings(parsedSettings);
      } else {
        console.log('No settings found, using defaults');
        setSettings(defaultSettings);
      }
      if (groupsJson) {
        const parsedGroups = JSON.parse(groupsJson);
        console.log('Loading groups from AsyncStorage:', parsedGroups);
        // Only load user-created groups (exclude "all" group)
        const userGroups = parsedGroups.filter((group: Group) => group.id !== 'all');
        setGroups(userGroups);
      } else {
        console.log('No groups found in AsyncStorage');
        setGroups([]);
      }
      // if (tournamentsJson) {
      //   setTournaments(JSON.parse(tournamentsJson));
      // }
    } catch (e) {
      console.error('Error loading app state:', e);
      setSettings(defaultSettings);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await loadAppState();
    };
    initializeApp();
  }, []);

  // Persist players/settings/tournaments
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    if (settings && !isLoading) {
      AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  // Persist groups to AsyncStorage
  useEffect(() => {
    if (groups.length > 0) {
      console.log('Saving groups to AsyncStorage:', groups);
      AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    }
  }, [groups]);



  // useEffect(() => {
  //   AsyncStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  // }, [tournaments]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  // Helper function to get all groups including virtual "All" group
  const getAllGroups = (): Group[] => {
    const virtualAllGroup = createVirtualAllGroup(players);
    return [virtualAllGroup, ...groups];
  };

  return (
    <AppStateContext.Provider
      value={{
        players,
        teams,
        settings: settings || defaultSettings,
        numberOfTeams,
        sessionPlayerIds,
        groups,
        getAllGroups,
        // tournaments,
        setPlayers,
        setTeams,
        setSettings,
        setNumberOfTeams,
        setSessionPlayerIds,
        setGroups,
        // setTournaments,
        loadAppState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}; 