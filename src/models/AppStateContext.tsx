import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player, Team, Settings, AppState, STORAGE_KEYS } from './types';
import { SORT_OPTIONS } from '../utils/constants';

interface AppStateContextProps extends AppState {
  setPlayers: (players: Player[]) => void;
  setTeams: (teams: Team[]) => void;
  setSettings: (settings: Settings) => void;
  setNumberOfNets: (nets: number) => void;
  setSessionPlayerIds: (ids: string[]) => void;
  loadAppState: () => Promise<void>;
}

const defaultSettings: Settings = {
  sortingPreferences: SORT_OPTIONS.map(o => o.key),
  darkMode: false,
};

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [numberOfNets, setNumberOfNets] = useState<number>(1);
  const [sessionPlayerIds, setSessionPlayerIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage on mount
  const loadAppState = async () => {
    try {
      const playersJson = await AsyncStorage.getItem(STORAGE_KEYS.PLAYERS);
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      console.log('Loading from AsyncStorage - settingsJson:', settingsJson);
      if (playersJson) setPlayers(JSON.parse(playersJson));
      if (settingsJson) {
        const parsedSettings = JSON.parse(settingsJson);
        console.log('Parsed settings:', parsedSettings);
        setSettings(parsedSettings);
      } else {
        console.log('No settings found, using defaults');
        setSettings(defaultSettings);
      }
    } catch (e) {
      console.error('Error loading app state:', e);
      setSettings(defaultSettings);
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

  // Persist players/settings
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    if (settings && !isLoading) {
      console.log('Saving settings to AsyncStorage:', settings);
      AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <AppStateContext.Provider
      value={{
        players,
        teams,
        settings: settings || defaultSettings,
        numberOfNets,
        sessionPlayerIds,
        setPlayers,
        setTeams,
        setSettings,
        setNumberOfNets,
        setSessionPlayerIds,
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