import * as React from 'react';
import { View, ScrollView, FlatList, KeyboardAvoidingView, Platform, Pressable, TouchableOpacity, Animated } from 'react-native';
import { Text, Button, Portal, Modal, List, IconButton, Checkbox, Dialog, RadioButton, useTheme, Switch, TextInput } from 'react-native-paper';
import { useAppState } from '../models/AppStateContext';
import { Team, Tournament, TournamentSettings, Match, COLOR_MAP, TournamentRound } from '../models/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_MARGIN } from '../utils/constants';
import { sharedStyles, screenHeight } from '../styles/shared';
import { generateBrackets, resetTournament, getActiveMatches, getTeamById, endTournament, progressTournament } from '../utils/tournamentUtils';
import { CustomThemeColors } from '../styles/Colors';
import styles from '../styles/TournamentScreenStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BracketMatchCard from '../components/BracketMatchCard';
import TabSelector from '../components/TabSelector';
import { useState } from 'react';

interface MatchCardProps {
  match: Match;
  tournament: Tournament;
  onWin: (matchId: string, teamId: string) => void;
  settings: any;
  isInteractive: boolean;
}

const CompactMatchCard: React.FC<MatchCardProps> = ({ match, tournament, onWin, settings, isInteractive }) => {
  const { colors } = useTheme();
  const team1 = getTeamById(tournament, match.team1Id);
  const team2 = getTeamById(tournament, match.team2Id);
  const matchesToWin = match.round === 1 
    ? tournament.settings.preliminaryMatchesPerRound 
    : tournament.settings.championshipMatchesPerRound;
  if (!team1 || !team2) return null;
  const isComplete = match.isComplete;
  const team1Color = COLOR_MAP[team1.name] || '#666';
  const team2Color = COLOR_MAP[team2.name] || '#666';
  let statusBadge = null;
  if (!isComplete && !isInteractive) {
    statusBadge = (
      <View style={[styles.compactBadge, { backgroundColor: colors.surfaceVariant }]}> 
        <Text style={[styles.compactBadgeText, { color: colors.onSurfaceVariant }]}>Upcoming</Text>
      </View>
    );
  }
  return (
    <View style={[styles.compactMatchCard, { backgroundColor: colors.surface }]}> 
      <View style={styles.verticalTeamStack}>
        {/* Team 1 Row */}
        <View style={[
          styles.verticalTeamRow,
          isComplete && match.winnerId === (team1 ? team1.id : undefined)
            ? [
                styles.verticalTeamWinner,
                { backgroundColor: colors.secondaryContainer },
              ]
            : null,
        ]}>
          <View style={[styles.compactTeamIndicator, { backgroundColor: team1 ? COLOR_MAP[team1.name] || colors.outline : colors.outline }]} />
          <Text style={[styles.verticalTeamName, { color: isComplete && match.winnerId === (team1 ? team1.id : undefined) ? CustomThemeColors[settings.darkMode ? 'dark' : 'light'].success : colors.onSurface }]}>{team1 ? team1.name : 'TBD'}</Text>
          <Text style={[styles.verticalTeamScore, { color: colors.onSurface }]}>{typeof match.team1Wins === 'number' ? match.team1Wins : '-'}</Text>
          {!isComplete && isInteractive && team1 && (
            <Pressable
              style={({ pressed }) => [
                { marginLeft: 8, marginRight: 2, justifyContent: 'center', alignItems: 'center' },
              ]}
              onPress={() => onWin(match.id, match.team1Id)}
              accessibilityLabel={`Mark ${team1.name} as winner`}
            >
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.secondary, lineHeight: 36 }}>
                +
              </Text>
            </Pressable>
          )}
        </View>
        {/* Team 2 Row */}
        <View style={[
          styles.verticalTeamRow,
          isComplete && match.winnerId === (team2 ? team2.id : undefined)
            ? [
                styles.verticalTeamWinner,
                { backgroundColor: colors.secondaryContainer },
              ]
            : null,
        ]}>
          <View style={[styles.compactTeamIndicator, { backgroundColor: team2 ? COLOR_MAP[team2.name] || colors.outline : colors.outline }]} />
          <Text style={[styles.verticalTeamName, { color: isComplete && match.winnerId === (team2 ? team2.id : undefined) ? CustomThemeColors[settings.darkMode ? 'dark' : 'light'].success : colors.onSurface }]}>{team2 ? team2.name : 'TBD'}</Text>
          <Text style={[styles.verticalTeamScore, { color: colors.onSurface }]}>{typeof match.team2Wins === 'number' ? match.team2Wins : '-'}</Text>
          {!isComplete && isInteractive && team2 && (
            <Pressable
              style={({ pressed }) => [
                { marginLeft: 8, marginRight: 2, justifyContent: 'center', alignItems: 'center' },
              ]}
              onPress={() => onWin(match.id, match.team2Id)}
              accessibilityLabel={`Mark ${team2.name} as winner`}
            >
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.secondary, lineHeight: 36 }}>
                +
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      <Text style={[styles.compactMatchesToWin, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>First to {matchesToWin} wins</Text>
      {isComplete && (
        <Text style={[styles.compactWinnerText, { color: CustomThemeColors[settings.darkMode ? 'dark' : 'light'].success, textAlign: 'center' }]}>Winner: {getTeamById(tournament, match.winnerId!)?.name}</Text>
      )}
      {statusBadge}
    </View>
  );
};

interface BracketVisualizationProps {
  tournament: Tournament;
  settings: any;
  bracket?: 'winner' | 'loser' | 'final'; // Optional: if set, only show this bracket
}

const BracketVisualization: React.FC<BracketVisualizationProps> = ({ tournament, settings, bracket }) => {
  const { colors } = useTheme();

  // Filter rounds by bracket if specified
  const filteredRounds = bracket
    ? tournament.rounds.filter((r: TournamentRound) => r.bracket === bracket)
    : tournament.rounds.filter((r: TournamentRound) => r.bracket === 'winner');

    console.log("Rounds")
    console.log(filteredRounds)
  // For finals, show all 'final' rounds in a single column
  if (bracket === 'final') {
    const hasFinals = filteredRounds.length > 0 && filteredRounds.some(r => r.matches.length > 0);
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.bracketVisualization, { minHeight: 160 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={[styles.roundColumn, styles.finalRoundColumn]}>
            <Text style={[styles.bracketTitle, { color: colors.onSurface, textAlign: 'center', marginBottom: 8 }]}>Finals</Text>
            {hasFinals ? (
              filteredRounds.flatMap((finalRound: TournamentRound) =>
                finalRound.matches.map((match: Match, matchIndex: number) => (
                  <BracketMatchCard
                    key={matchIndex}
                    match={match}
                    tournament={tournament}
                    settings={settings}
                  />
                ))
              )
            ) : (
              <BracketMatchCard
                match={{ id: 'finals_tbd', team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, isComplete: false, round: 1, bracket: 'final', matchNumber: 1 }}
                tournament={tournament}
                settings={settings}
              />
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  // For winner/loser brackets, show rounds in columns
  const hasRounds = filteredRounds.length > 0 && filteredRounds.some(r => r.matches.length > 0);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.bracketVisualization, { minHeight: 160 }]}> 
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {hasRounds ? (
          filteredRounds.map((round: TournamentRound, roundIdx: number) => (
            <View key={roundIdx} style={styles.roundColumn}>
              <Text style={[styles.bracketTitle, { color: colors.onSurface, textAlign: 'center', marginBottom: 8 }]}>Round {round.roundNumber}</Text>
              {round.matches.map((match: Match, matchIndex: number) => (
                <BracketMatchCard
                  key={matchIndex}
                  match={match}
                  tournament={tournament}
                  settings={settings}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.roundColumn}>
            <Text style={[styles.bracketTitle, { color: colors.onSurface, textAlign: 'center', marginBottom: 8 }]}>Round 1</Text>
            <BracketMatchCard
              match={{ id: `winner_tbd`, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, isComplete: false, round: 1, bracket: 'winner', matchNumber: 1 }}
              tournament={tournament}
              settings={settings}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default function TournamentScreen() {
  const { teams, tournaments, setTournaments, settings } = useAppState();
  const [currentTournament, setCurrentTournament] = React.useState<Tournament | null>(null);
  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const [tournamentSettings, setTournamentSettings] = React.useState<TournamentSettings>({
    doubleElimination: false,
    preliminaryMatchesPerRound: 1,
    championshipMatchesPerRound: 1,
  });
  const { colors } = useTheme();

  // State for tournament name input
  const [tournamentNameInput, setTournamentNameInput] = React.useState('');

  // Collapsible summary card state
  const [summaryExpanded, setSummaryExpanded] = React.useState(true);
  const chevronAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(chevronAnim, {
      toValue: summaryExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [summaryExpanded]);
  const chevronRotation = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Load the most recent tournament or create a new one
  React.useEffect(() => {
    if (tournaments.length > 0) {
      setCurrentTournament(tournaments[tournaments.length - 1]);
    }
  }, [tournaments]);

  // BYOT state
  const [teamMode, setTeamMode] = React.useState<'session' | 'byot'>('session');
  const [byotTeamNames, setByotTeamNames] = React.useState(['', '']);

  // Helper for BYOT: only allow even number of teams
  const byotCanAddTeam = teamMode === 'byot' && byotTeamNames.length % 2 === 0;
  const byotCanRemoveTeam = teamMode === 'byot' && byotTeamNames.length > 2;

  const handleCreateTournament = () => {
    if (teamMode === 'byot') {
      // BYOT mode: require at least 2 non-empty team names
      const validNames = byotTeamNames.map(n => n.trim()).filter(Boolean);
      if (validNames.length < 2) return;
      const tournamentId = Math.random().toString(36).slice(2, 10);
      const tournamentTeams = validNames.map((name, i) => ({ id: `${tournamentId}_byot_${i + 1}`, name, players: [], losses: 0 }));
      const rounds = generateBrackets(tournamentTeams, tournamentSettings);
      const newTournament: Tournament = {
        id: tournamentId,
        name: tournamentNameInput.trim() ? tournamentNameInput.trim() : 'Tournament',
        teams: tournamentTeams,
        settings: tournamentSettings,
        rounds,
        isComplete: false,
      };
      const updatedTournaments = [...tournaments, newTournament];
      setTournaments(updatedTournaments);
      setCurrentTournament(newTournament);
      setCreateModalVisible(false);
      setTournamentNameInput('');
      setTeamMode('session');
      setByotTeamNames(['', '']);
      return;
    }
    if (teams.length < 2) {
      // Show error - need at least 2 teams
      return;
    }
    const tournamentId = Math.random().toString(36).slice(2, 10);
    const rounds = generateBrackets(teams, tournamentSettings);
    const tournamentTeams = teams.map(team => ({ ...team, losses: 0 }));
    const newTournament: Tournament = {
      id: tournamentId,
      name: tournamentNameInput.trim() ? tournamentNameInput.trim() : 'Tournament',
      teams: tournamentTeams,
      settings: tournamentSettings,
      rounds,
      isComplete: false,
    };
    const updatedTournaments = [...tournaments, newTournament];
    setTournaments(updatedTournaments);
    setCurrentTournament(newTournament);
    setCreateModalVisible(false);
    setTournamentNameInput('');
  };

  const handleWin = (matchId: string, teamId: string) => {
    if (!currentTournament || currentTournament.isComplete) return;
    const updatedTournament = progressTournament(currentTournament, matchId, teamId);
    const updatedTournaments = tournaments.map(t =>
      t.id === currentTournament.id ? updatedTournament : t
    );
    setTournaments(updatedTournaments);
    setCurrentTournament(updatedTournament);
  };

  const handleEndTournament = () => {
    if (!currentTournament) return;
    
    const updatedTournament = endTournament(currentTournament);
    const updatedTournaments = tournaments.map(t => 
      t.id === currentTournament.id ? updatedTournament : t
    );
    setTournaments(updatedTournaments);
    setCurrentTournament(updatedTournament);
  };

  const handleResetTournament = () => {
    if (!currentTournament) return;
    
    const updatedTournament = resetTournament(currentTournament);
    const updatedTournaments = tournaments.map(t => 
      t.id === currentTournament.id ? updatedTournament : t
    );
    setTournaments(updatedTournaments);
    setCurrentTournament(updatedTournament);
  };

  const handleClearTournament = () => {
    if (!currentTournament) return;
    
    // Remove the current tournament from the list
    const updatedTournaments = tournaments.filter(t => t.id !== currentTournament.id);
    setTournaments(updatedTournaments);
    setCurrentTournament(null);
  };

  const handleSettingsChange = (newSettings: Partial<TournamentSettings>) => {
    setTournamentSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Find the lowest active round number (across all brackets except finals)
  const incompleteRounds = currentTournament
    ? currentTournament.rounds.filter(r => r.bracket !== 'final' && r.matches.some(m => !m.isComplete))
    : [];
  const lowestActiveRoundNumber = incompleteRounds.length > 0
    ? Math.min(...incompleteRounds.map(r => r.roundNumber))
    : null;

  // Active matches: only from the lowest active round
  let activeMatches = currentTournament && lowestActiveRoundNumber !== null
    ? currentTournament.rounds
        .filter(r => r.roundNumber === lowestActiveRoundNumber && r.bracket !== 'final')
        .flatMap(r => r.matches.filter(m => !m.isComplete && m.team1Id && m.team2Id))
    : [];

  // Include finals matches as active if they are not complete and all previous rounds are complete
  if (currentTournament) {
    const finalsRound = currentTournament.rounds.find(r => r.bracket === 'final');
    if (finalsRound && finalsRound.matches.some(m => !m.isComplete)) {
      // Check if all non-final rounds are complete
      const allPrevRoundsComplete = currentTournament.rounds
        .filter(r => r.bracket !== 'final')
        .every(r => r.isComplete);
      if (allPrevRoundsComplete) {
        activeMatches = [
          ...activeMatches,
          ...finalsRound.matches.filter(m => !m.isComplete && m.team1Id && m.team2Id),
        ];
      }
    }
  }

  // Upcoming matches: all incomplete matches in non-active, non-final rounds
  const upcomingMatches = currentTournament && lowestActiveRoundNumber !== null
    ? currentTournament.rounds
        .filter(r => r.bracket !== 'final' && r.roundNumber !== lowestActiveRoundNumber)
        .flatMap(r => r.matches.filter(m => !m.isComplete))
    : [];

  const isTournamentInteractive = Boolean(currentTournament && !currentTournament.isComplete);

  // Stats row logic: show just "# Matches/Round" if both are the same, else show both
  const showCombinedMatchesPerRound = currentTournament && currentTournament.settings.preliminaryMatchesPerRound === currentTournament.settings.championshipMatchesPerRound;

  // Button enabled logic
  const canCreateTournament = teamMode === 'byot'
    ? byotTeamNames.filter(n => n.trim()).length >= 2 && byotTeamNames.every(n => n.trim().length > 0)
    : teams.length >= 2;

  const [selectedBracketTab, setSelectedBracketTab] = useState<'winner' | 'loser' | 'final'>('winner');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onBackground }]}>
          Tournaments
        </Text>
        <View style={styles.headerButtons}>
          {currentTournament && (
            <IconButton
              icon="refresh"
              size={24}
              onPress={handleResetTournament}
              iconColor={colors.onBackground}
            />
          )}
          {currentTournament && (
            <IconButton
              icon="delete"
              size={24}
              onPress={handleClearTournament}
              iconColor={colors.error}
            />
          )}
        </View>
      </View>

      {currentTournament ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          

          {/* Active Matches */}
          {activeMatches.length > 0 && (
            <View style={styles.matchesSection}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Active Matches</Text>
              {activeMatches.map((match) => (
                <CompactMatchCard
                  key={match.id}
                  match={match}
                  tournament={currentTournament}
                  onWin={handleWin}
                  settings={settings}
                  isInteractive={isTournamentInteractive}
                />
              ))}
            </View>
          )}

          {/* Upcoming Matches */}
          {upcomingMatches.length > 0 && (
            <View style={styles.matchesSection}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Upcoming Matches</Text>
              {upcomingMatches.map((match) => (
                <CompactMatchCard
                  key={match.id}
                  match={match}
                  tournament={currentTournament}
                  onWin={handleWin}
                  settings={settings}
                  isInteractive={false}
                />
              ))}
            </View>
          )}
          
          
          {/* Tournament Summary Card Refactor */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}> 
            {/* Collapsible Header */}
            <TouchableOpacity activeOpacity={0.8} onPress={() => setSummaryExpanded(e => !e)} style={styles.summaryHeader}>
              <Text style={[styles.statusTitle, { color: colors.onSurface }]}>{currentTournament.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[
                  styles.statusBadge,
                  currentTournament.isComplete ? styles.statusBadgeCompleted : styles.statusBadgeInProgress,
                  { backgroundColor: currentTournament.isComplete
                      ? CustomThemeColors[settings.darkMode ? 'dark' : 'light'].success
                      : CustomThemeColors[settings.darkMode ? 'dark' : 'light'].warning }
                ]}>
                  <Text style={[styles.statusBadgeText, { color: currentTournament.isComplete
                      ? CustomThemeColors[settings.darkMode ? 'dark' : 'light'].onSuccess
                      : CustomThemeColors[settings.darkMode ? 'dark' : 'light'].onWarning }]}> 
                    {currentTournament.isComplete ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
                <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                  <MaterialCommunityIcons name="chevron-down" size={28} color={colors.onSurfaceVariant} />
                </Animated.View>
              </View>
            </TouchableOpacity>
            {/* Stats Row as horizontal scroll (always visible) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'nowrap', marginBottom: 10 }}>
              <Text style={[styles.summaryStat, { color: colors.onSurfaceVariant }]}>
                {currentTournament.settings.doubleElimination ? 'Double Elimination' : 'Single Elimination'}
              </Text>
              {showCombinedMatchesPerRound ? (
                  <Text style={[styles.summaryStat, { color: colors.onSurfaceVariant }]}>{currentTournament.settings.preliminaryMatchesPerRound} Matches/Round</Text>
                ) : (
                <>
                  <Text style={[styles.summaryStat, { color: colors.onSurfaceVariant }]}>{currentTournament.settings.preliminaryMatchesPerRound} Matches/Prelim</Text>
                  <Text style={[styles.summaryStat, { color: colors.onSurfaceVariant }]}>{currentTournament.settings.championshipMatchesPerRound} Matches/Champ</Text>
                </>
              )}
              <Text style={[styles.summaryStat, { color: colors.onSurfaceVariant }]}>{currentTournament.teams.length} Teams</Text>
              <Text style={[styles.summaryStat, { color: colors.onSurfaceVariant }]}>{currentTournament.rounds.reduce((acc, r) => acc + r.matches.filter(m => m.isComplete).length, 0)} Played</Text>
            </ScrollView>
            {summaryExpanded && (
              <>
                {/* Bracket Visualization */}
                {currentTournament && (
                  <View style={{ marginTop: 16 }}>
                    {currentTournament.settings.doubleElimination ? (
                      <>
                                  <TabSelector
            options={[
              { key: 'winner', label: 'Upper' },
              { key: 'loser', label: 'Lower' },
              { key: 'final', label: 'Finals' }
            ]}
            selectedKey={selectedBracketTab}
            onSelect={(key) => setSelectedBracketTab(key as 'winner' | 'loser' | 'final')}
            style={{ marginBottom: 8 }}
          />
                        <BracketVisualization
                          tournament={currentTournament}
                          settings={currentTournament.settings}
                          bracket={selectedBracketTab}
                        />
                      </>
                    ) : (
                      <BracketVisualization
                        tournament={currentTournament}
                        settings={currentTournament.settings}
                      />
                    )}
                  </View>
                )}
                {/* Ongoing Matches */}
                {!currentTournament.isComplete && (
                  <>
                    <Text style={[styles.summarySectionTitle, { color: colors.onSurfaceVariant }]}>Ongoing Matches</Text>
                    {getActiveMatches(currentTournament).length === 0 ? (
                      <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, marginBottom: 4 }}>No active matches</Text>
                    ) : (
                      getActiveMatches(currentTournament).map((match) => {
                        const team1 = getTeamById(currentTournament, match.team1Id);
                        const team2 = getTeamById(currentTournament, match.team2Id);
                        return (
                          <View key={match.id} style={[styles.matchRow, { backgroundColor: colors.surfaceVariant, borderRadius: 8, marginBottom: 4, paddingVertical: 6, paddingHorizontal: 8 }]}> 
                            <Text style={{ fontWeight: 'bold', color: colors.onSurface, minWidth: 24 }}>{team1?.name || 'TBD'}</Text>
                            <Text style={{ color: colors.onSurface, fontWeight: 'bold', minWidth: 18, textAlign: 'center' }}>{match.team1Wins}</Text>
                            <Text style={[styles.bracketVsText, { color: colors.onSurfaceVariant }]}>vs</Text>
                            <Text style={{ color: colors.onSurface, fontWeight: 'bold', minWidth: 18, textAlign: 'center' }}>{match.team2Wins}</Text>
                            <Text style={{ fontWeight: 'bold', color: colors.onSurface, minWidth: 24 }}>{team2?.name || 'TBD'}</Text>
                            <Text style={[styles.matchActiveBadge, { backgroundColor: CustomThemeColors[settings.darkMode ? 'dark' : 'light'].info }]}> 
                              <Text style={[styles.matchActiveBadgeText, { color: CustomThemeColors[settings.darkMode ? 'dark' : 'light'].onInfo }]}>Active</Text>
                            </Text>
                            <Text style={{ color: colors.onSurfaceVariant, marginLeft: 8, fontSize: 12 }}>{match.bracket.charAt(0).toUpperCase() + match.bracket.slice(1)} R{match.round}</Text>
                          </View>
                        );
                      })
                    )}
                  </>
                )}
                {/* Standings Table */}
                <Text style={[styles.summarySectionTitle, { color: colors.onSurfaceVariant }]}>Team Standings</Text>
                <View style={styles.standingsTable}>
                  <View style={[styles.standingsRow, { borderBottomWidth: 2, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surfaceVariant }]}> 
                    <Text style={[styles.standingsStat, { flex: 0.5, color: colors.onSurfaceVariant }]}> </Text>
                    <Text style={[styles.standingsStat, { flex: 2, color: colors.onSurfaceVariant }]}>Team</Text>
                    <Text style={[styles.standingsStat, { flex: 1, color: colors.onSurfaceVariant }]}>Wins</Text>
                    <Text style={[styles.standingsStat, { flex: 1, color: colors.onSurfaceVariant }]}>Losses</Text>
                    <Text style={[styles.standingsStat, { flex: 1, color: colors.onSurfaceVariant }]}>Status</Text>
                  </View>
                  {currentTournament.teams.map(team => {
                    const isEliminated = team.losses >= (currentTournament.settings.doubleElimination ? 2 : 1);
                    const isWinner = currentTournament.isComplete && currentTournament.winner === team.id;
                    const isRunnerUp = currentTournament.isComplete && currentTournament.runnerUp === team.id;
                    // Count wins: matches where this team is winner
                    const wins = currentTournament.rounds.reduce((acc, r) => acc + r.matches.filter(m => m.winnerId === team.id).length, 0);
                    return (
                      <View key={team.id} style={[styles.standingsRow, {
                        backgroundColor: isEliminated ? colors.surfaceDisabled : colors.surface,
                        borderRadius: 6,
                        marginBottom: 2,
                        borderBottomColor: colors.outlineVariant,
                      }]}> 
                        <View style={[styles.standingsTeamBadge, { backgroundColor: COLOR_MAP[team.name] || colors.outline }]} />
                        <Text style={[
                          styles.standingsTeamName,
                          isWinner ? styles.standingsWinner : isRunnerUp ? styles.standingsRunnerUp : null,
                          { flex: 2, color: isWinner
                              ? CustomThemeColors[settings.darkMode ? 'dark' : 'light'].gold
                              : isRunnerUp
                              ? CustomThemeColors[settings.darkMode ? 'dark' : 'light'].silver
                              : isEliminated
                              ? colors.onSurfaceDisabled
                              : colors.onSurface }
                        ]} numberOfLines={1} ellipsizeMode="tail">{team.name}</Text>
                        <Text style={[styles.standingsStat, { flex: 1, color: isEliminated ? colors.onSurfaceDisabled : colors.onSurface }]}>{wins}</Text>
                        <Text style={[styles.standingsStat, { flex: 1, color: isEliminated ? colors.onSurfaceDisabled : colors.onSurface }]}>{team.losses}</Text>
                        <Text style={[styles.standingsStat, { flex: 1, color: isEliminated ? colors.onSurfaceDisabled : colors.onSurface }]}> 
                          {isWinner ? 'Winner' : isRunnerUp ? '2nd Place' : isEliminated ? 'Eliminated' : 'In Play'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                {/* Winner/Runner-up Section if complete */}
                {currentTournament.isComplete && currentTournament.winner && (
                  <View style={{ marginTop: 12, alignItems: 'center' }}>
                    <Text style={[styles.summarySectionTitle, { color: colors.onSurfaceVariant }]}>Results</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <MaterialCommunityIcons name="trophy" size={32} color="#FFD700" style={{ marginRight: 8 }} />
                      <Text style={{ fontWeight: 'bold', fontSize: 20, color: CustomThemeColors[settings.darkMode ? 'dark' : 'light'].success }}>
                        Winner: {getTeamById(currentTournament, currentTournament.winner)?.name}
                      </Text>
                    </View>
                    {currentTournament.runnerUp && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <MaterialCommunityIcons name="medal" size={24} color="#C0C0C0" style={{ marginRight: 8 }} />
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.onSurfaceVariant }}>
                          2nd Place: {getTeamById(currentTournament, currentTournament.runnerUp)?.name}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>

        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
            No tournament in progress
          </Text>
        </View>
      )}

      {/* Create Tournament Modal */}
      <Portal>
        <Modal
          visible={createModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.surface }]}
        >
          <View style={sharedStyles.modalHeader}>
            <Text style={[sharedStyles.modalTitle, { color: colors.onSurface }]}> 
              Create Tournament
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setCreateModalVisible(false)}
              iconColor={colors.onSurface}
            />
          </View>

          <ScrollView style={sharedStyles.modalScrollView}>
            {/* Team Mode Tab Selector */}
            <TabSelector
              options={[
                { key: 'session', label: 'Session Teams' },
                { key: 'byot', label: 'Custom Teams' }
              ]}
              selectedKey={teamMode}
              onSelect={(key) => setTeamMode(key as 'session' | 'byot')}
              style={{ marginBottom: 18, marginTop: 2 }}
            />

            {/* Tournament Name Input */}
            <TextInput
              label="Tournament Name (optional)"
              value={tournamentNameInput}
              onChangeText={setTournamentNameInput}
              mode="outlined"
              style={{
                marginBottom: 18,
                backgroundColor: colors.surfaceVariant,
                fontSize: 16,
              }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              maxLength={32}
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="done"
              theme={{ colors: { text: colors.onSurface, placeholder: colors.onSurfaceVariant } }}
            />

            {/* Elimination Type Selector as Segmented Button */}
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.onSurface }]}>Elimination</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surfaceVariant }}>
                <Pressable
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    backgroundColor: !tournamentSettings.doubleElimination ? colors.primary : 'transparent',
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                  }}
                  onPress={() => handleSettingsChange({ doubleElimination: false })}
                >
                  <Text style={{ color: !tournamentSettings.doubleElimination ? colors.onPrimary : colors.onSurfaceVariant, fontWeight: 'bold' }}>Single</Text>
                </Pressable>
                <Pressable
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    backgroundColor: tournamentSettings.doubleElimination ? colors.primary : 'transparent',
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                  onPress={() => handleSettingsChange({ doubleElimination: true })}
                >
                  <Text style={{ color: tournamentSettings.doubleElimination ? colors.onPrimary : colors.onSurfaceVariant, fontWeight: 'bold' }}>Double</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.onSurface }]}> 
                Preliminary Matches per Round
              </Text>
              <View style={styles.counterContainer}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => handleSettingsChange({ 
                    preliminaryMatchesPerRound: Math.max(1, tournamentSettings.preliminaryMatchesPerRound - 1) 
                  })}
                  iconColor={colors.onSurface}
                />
                <Text style={[styles.counterValue, { color: colors.onSurface }]}> 
                  {tournamentSettings.preliminaryMatchesPerRound}
                </Text>
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => handleSettingsChange({ 
                    preliminaryMatchesPerRound: tournamentSettings.preliminaryMatchesPerRound + 1 
                  })}
                  iconColor={colors.onSurface}
                />
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.onSurface }]}> 
                Championship Matches per Round
              </Text>
              <View style={styles.counterContainer}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => handleSettingsChange({ 
                    championshipMatchesPerRound: Math.max(1, tournamentSettings.championshipMatchesPerRound - 1) 
                  })}
                  iconColor={colors.onSurface}
                />
                <Text style={[styles.counterValue, { color: colors.onSurface }]}> 
                  {tournamentSettings.championshipMatchesPerRound}
                </Text>
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => handleSettingsChange({ 
                    championshipMatchesPerRound: tournamentSettings.championshipMatchesPerRound + 1 
                  })}
                  iconColor={colors.onSurface}
                />
              </View>
            </View>

            {/* BYOT Team Name Inputs */}
            {teamMode === 'byot' ? (
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.teamsPreviewTitle, { color: colors.onSurface, marginBottom: 6 }]}>Enter Team Names</Text>
                {byotTeamNames.map((name, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <TextInput
                      value={name}
                      onChangeText={text => setByotTeamNames(names => names.map((n, i) => i === idx ? text : n))}
                      placeholder={`Team ${idx + 1}`}
                      style={{ flex: 1, marginRight: 8, backgroundColor: colors.surfaceVariant }}
                      mode="outlined"
                      maxLength={24}
                      dense
                    />
                    {byotCanRemoveTeam && (
                      <IconButton icon="delete" size={20} onPress={() => setByotTeamNames(names => names.filter((_, i) => i !== idx))} />
                    )}
                  </View>
                ))}
                <Button
                  mode="outlined"
                  onPress={() => byotCanAddTeam && setByotTeamNames(names => [...names, '', ''])}
                  style={{ marginTop: 4, opacity: byotCanAddTeam ? 1 : 0.5 }}
                  icon="plus"
                  textColor={colors.primary}
                  disabled={!byotCanAddTeam}
                >
                  Add Teams
                </Button>
                {!byotCanAddTeam && (
                  <Text style={{ color: colors.error, fontSize: 12, marginTop: 2 }}>
                    Number of teams must be even
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.teamsPreview}>
                <Text style={[styles.teamsPreviewTitle, { color: colors.onSurface }]}>Teams</Text>
                {teams.length === 0 ? (
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, marginBottom: 10 }}>
                    No teams found. Create teams for your current session to get started.
                  </Text>
                ) : (
                  teams.map((team, index) => (
                    <View key={team.id} style={styles.teamPreview}>
                      <View style={[styles.teamPreviewIndicator, { backgroundColor: COLOR_MAP[team.name] }]} />
                      <Text style={[styles.teamPreviewName, { color: colors.onSurface }]}>{team.name}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleCreateTournament}
              style={[styles.createTournamentButton, { backgroundColor: colors.primary, opacity: canCreateTournament ? 1 : 0.5 }]}
              labelStyle={{ color: colors.onPrimary }}
              disabled={!canCreateTournament}
            >
              Create Tournament
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      {!currentTournament && (
        <View style={styles.fab}>
          <IconButton
            icon="plus"
            size={24}
            onPress={() => setCreateModalVisible(true)}
            iconColor={colors.onPrimary}
            style={[styles.fabButton, { backgroundColor: colors.primary }]}
          />
        </View>
      )}
    </SafeAreaView>
  );
} 