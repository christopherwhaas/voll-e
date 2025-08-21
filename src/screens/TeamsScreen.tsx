import * as React from 'react';
import { View, ScrollView, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Modal, List, IconButton, Checkbox, Dialog, RadioButton, useTheme, Surface } from 'react-native-paper';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useAppState } from '../models/AppStateContext';
import { Player, COLOR_NAMES, SKILL_VALUES, Team, COLOR_MAP } from '../models/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_MARGIN, skillLevelEmojis } from '../utils/constants';
import { sharedStyles } from '../styles/shared';
import PlayerForm, { PlayerFormValues } from '../components/PlayerForm';
import TeamCard from '../components/TeamCard';
import SettingsDrawer from '../components/SettingsDrawer';
import GroupSelector from '../components/GroupSelector';
import MultiSelectTabs from '../components/MultiSelectTabs';
import { generateRandomTeams, generateSnakeDraftTeams } from '../utils/teamGeneration';
import styles from '../styles/TeamsScreenStyles';

// Helper to get random color names for teams
function getRandomColorNames(numTeams: number): string[] {
  const shuffled = [...COLOR_NAMES].sort(() => Math.random() - 0.5);
  if (numTeams <= COLOR_NAMES.length) {
    return shuffled.slice(0, numTeams);
  } else {
    // If more teams than colors, repeat colors as needed
    const result = [];
    for (let i = 0; i < numTeams; i++) {
      result.push(shuffled[i % COLOR_NAMES.length]);
    }
    return result;
  }
}

export default function TeamsScreen() {
  const { players, sessionPlayerIds, setSessionPlayerIds, teams, setTeams, setPlayers, numberOfTeams, setNumberOfTeams, settings, setSettings, groups, getAllGroups } = useAppState();
  const [swapDialogVisible, setSwapDialogVisible] = React.useState(false);
  const [swapPlayer, setSwapPlayer] = React.useState<{ player: Player; fromTeamId: string } | null>(null);
  const [swapTargetPlayer, setSwapTargetPlayer] = React.useState<{ player: Player; teamId: string } | null>(null);
  const [sessionDrawerVisible, setSessionDrawerVisible] = React.useState(false);
  const [sessionDrawerExpanded, setSessionDrawerExpanded] = React.useState(false);
  const [drawerTranslateY, setDrawerTranslateY] = React.useState(0);
  const [drawerHeight, setDrawerHeight] = React.useState(0);
  const [minDrawerHeight, setMinDrawerHeight] = React.useState(0);
  const [manualModalVisible, setManualModalVisible] = React.useState(false);
  const [manualTeams, setManualTeams] = React.useState<Team[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = React.useState<Player[]>([]);

  const [settingsDrawerVisible, setSettingsDrawerVisible] = React.useState(false);
  const { colors } = useTheme();
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});
  const [newPlayerModalVisible, setNewPlayerModalVisible] = React.useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = React.useState<string[]>(['all']);

  // Get session players
  const sessionPlayers = players.filter(p => sessionPlayerIds.includes(p.id));
  // All players filtered by group (including those already in session)
  const availablePlayers = React.useMemo(() => {
    if (selectedGroupFilter.includes('all')) {
      return players;
    }
    
    // Combine all selected groups' player IDs and remove duplicates
    const allPlayerIds = new Set<string>();
    const allGroups = getAllGroups();
    selectedGroupFilter.forEach(groupId => {
      const group = allGroups.find(g => g.id === groupId);
      if (group) {
        group.playerIds.forEach(playerId => allPlayerIds.add(playerId));
      }
    });
    
    return players.filter(player => allPlayerIds.has(player.id));
  }, [players, getAllGroups, selectedGroupFilter]);

  // Auto-show session drawer when no players are in session
  React.useEffect(() => {
    if (sessionPlayers.length === 0) {
      setSessionDrawerVisible(true);
      setSessionDrawerExpanded(true);
      setDrawerTranslateY(0);
    } else if (!sessionDrawerVisible) {
      // Only set visible if it's not already visible, don't change expanded state
      setSessionDrawerVisible(true);
    }
  }, [sessionPlayers.length, sessionDrawerVisible]);

  // Modern gesture handler for drawer swipe
  const panGesture = React.useMemo(() => {
    return Gesture.Pan()
      .onUpdate((event) => {
        'worklet';
        const { translationY } = event;
        if (drawerHeight > 0 && minDrawerHeight > 0) {
          const maxTranslateY = drawerHeight - minDrawerHeight;
          const newTranslateY = Math.max(0, Math.min(maxTranslateY, translationY));
          runOnJS(setDrawerTranslateY)(newTranslateY);
        }
      })
      .onEnd((event) => {
        'worklet';
        const { translationY } = event;
        if (drawerHeight > 0 && minDrawerHeight > 0) {
          const threshold = (drawerHeight - minDrawerHeight) / 2;
          const shouldCollapse = translationY > threshold;
          
          if (shouldCollapse) {
            runOnJS(setSessionDrawerExpanded)(false);
          } else {
            runOnJS(setSessionDrawerExpanded)(true);
          }
        }
        runOnJS(setDrawerTranslateY)(0);
      });
  }, [drawerHeight, minDrawerHeight]);



  // Random Team Generation
  const handleRandomTeams = () => {
    const teamsArr = generateRandomTeams(players.filter(p => sessionPlayerIds.includes(p.id)), numberOfTeams, COLOR_NAMES);
    setTeams(teamsArr);
    setSessionDrawerExpanded(false);
  };

  // Balanced Team Generation
  const handleBalancedTeams = () => {
    const weights = settings.weights ?? {skillLevel: 5, teammatePreference: 0, teamSizePreference: 0};
    const teamsArr = generateSnakeDraftTeams(
      players.filter(p => sessionPlayerIds.includes(p.id)),
      { numberOfTeams, weights },
      COLOR_NAMES
    );
    setTeams(teamsArr);
    setSessionDrawerExpanded(false);
  };

  // Manual Team Generation
  const handleManualTeams = () => {
    const teamCount = numberOfTeams;
    const colorNames = getRandomColorNames(teamCount);
    const emptyTeams = Array.from({ length: teamCount }, (_, i) => ({
      id: (i + 1).toString(),
      name: colorNames[i],
      players: [] as Player[],
    }));
    setManualTeams(emptyTeams);
    setUnassignedPlayers([...sessionPlayers]);
    setManualModalVisible(true);
  };

  const handleAssignPlayerToTeam = (playerId: string, teamId: string) => {
    const player = unassignedPlayers.find(p => p.id === playerId);
    if (!player) return;

    // Remove player from unassigned
    setUnassignedPlayers(unassignedPlayers.filter(p => p.id !== playerId));
    
    // Add player to team
    setManualTeams(manualTeams.map(team => 
      team.id === teamId 
        ? { ...team, players: [...team.players, player] }
        : team
    ));
  };

  const handleRemovePlayerFromManualTeam = (playerId: string, teamId: string) => {
    const player = manualTeams.find(t => t.id === teamId)?.players.find(p => p.id === playerId);
    if (!player) return;

    // Remove player from team
    setManualTeams(manualTeams.map(team => 
      team.id === teamId 
        ? { ...team, players: team.players.filter(p => p.id !== playerId) }
        : team
    ));
    
    // Add player back to unassigned
    setUnassignedPlayers([...unassignedPlayers, player]);
  };

  const handleConfirmManualTeams = () => {
    setTeams(manualTeams);
    setManualModalVisible(false);
    setManualTeams([]);
    setUnassignedPlayers([]);
    setSessionDrawerExpanded(false);
  };

  const handleCancelManualTeams = () => {
    setManualModalVisible(false);
    setManualTeams([]);
    setUnassignedPlayers([]);
  };

  const handleRemoveFromSession = (id: string) => {
    setSessionPlayerIds(sessionPlayerIds.filter(pid => pid !== id));
  };

  const handleTogglePlayerSelection = (id: string) => {
    if (sessionPlayerIds.includes(id)) {
      // Remove from session
      setSessionPlayerIds(sessionPlayerIds.filter(pid => pid !== id));
    } else {
      // Add to session
      setSessionPlayerIds([...sessionPlayerIds, id]);
    }
  };

  const handleSelectAllAvailable = () => {
    const availablePlayerIds = availablePlayers.map(p => p.id);
    const newSessionPlayerIds = [...new Set([...sessionPlayerIds, ...availablePlayerIds])];
    setSessionPlayerIds(newSessionPlayerIds);
  };

  const handleUnselectAllAvailable = () => {
    const availablePlayerIds = availablePlayers.map(p => p.id);
    setSessionPlayerIds(sessionPlayerIds.filter(id => !availablePlayerIds.includes(id)));
  };

  const handleSelectGroupFilter = (groupId: string) => {
    setSelectedGroupFilter(currentIds => {
      if (groupId === 'all') {
        // If "All" is selected, clear other selections
        return ['all'];
      }
      
      if (currentIds.includes(groupId)) {
        // Remove from selection
        const newIds = currentIds.filter(id => id !== groupId);
        // If no groups selected, default to "All"
        return newIds.length === 0 ? ['all'] : newIds;
      } else {
        // Add to selection, remove "All" if it was selected
        return [...currentIds.filter(id => id !== 'all'), groupId];
      }
    });
  };

  const handleAddNewPlayer = (data: PlayerFormValues) => {
    const id = Math.random().toString(36).slice(2, 10);
    const player = { id, ...data };
    setPlayers([...players, player]);
    setSessionPlayerIds([...sessionPlayerIds, id]);
    setNewPlayerModalVisible(false);
  };

  const handleCancelNewPlayer = () => {
    setNewPlayerModalVisible(false);
  };

  const handleEditTeamName = (teamId: string, newName: string) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, name: newName } : t));
  };

  const handleRemovePlayerFromTeam = (teamId: string, playerId: string) => {
    // Remove player from team, add back to session pool
    setTeams(teams.map(t => t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== playerId) } : t));
    setSessionPlayerIds([...sessionPlayerIds, playerId]);
  };

  const handleClearTeams = () => {
    setTeams([]);
  };

  // Helper to calculate average skill
  const getTeamAvgSkill = (team: Team): string => {
    if (!team.players.length) return '0.00';
    return (
      team.players.reduce((sum: number, p: Player) => sum + SKILL_VALUES[p.skillLevel], 0) / team.players.length
    ).toFixed(2);
  };

  // Helper to get all players from other teams for swapping
  const getOtherTeamPlayers = (excludeTeamId: string): Array<{ player: Player; teamId: string; teamName: string; teamAvgSkill: string }> => {
    const otherPlayers: Array<{ player: Player; teamId: string; teamName: string; teamAvgSkill: string }> = [];
    teams.forEach(team => {
      if (team.id !== excludeTeamId) {
        team.players.forEach(player => {
          otherPlayers.push({ 
            player, 
            teamId: team.id, 
            teamName: team.name,
            teamAvgSkill: getTeamAvgSkill(team)
          });
        });
      }
    });
    return otherPlayers;
  };

  const handleSwapPlayer = (player: Player, fromTeamId: string) => {
    setSwapPlayer({ player, fromTeamId });
    setSwapTargetPlayer(null);
    setSwapDialogVisible(true);
  };

  const confirmSwapPlayer = () => {
    if (!swapPlayer || !swapTargetPlayer) return;
    
    // Perform the swap
    const updatedTeams = teams.map(t => {
      if (t.id === swapPlayer.fromTeamId) {
        // Remove the first player and add the second player
        return { 
          ...t, 
          players: t.players.filter(p => p.id !== swapPlayer.player.id).concat([swapTargetPlayer.player])
        };
      } else if (t.id === swapTargetPlayer.teamId) {
        // Remove the second player and add the first player
        return { 
          ...t, 
          players: t.players.filter(p => p.id !== swapTargetPlayer.player.id).concat([swapPlayer.player])
        };
      }
      return t;
    });
    
    setTeams(updatedTeams);
    setSwapDialogVisible(false);
    setSwapPlayer(null);
    setSwapTargetPlayer(null);
  };





  // Settings handlers
  const handleSaveSettings = (newSettings: { weights: { skillLevel: number; teammatePreference: number; teamSizePreference: number }; darkMode: boolean }) => {
    setSettings(newSettings);
  };

  // Header: modern and minimal design
  const renderHeader = () => (
    <>
      {/* Title and Action Buttons Row */}
      <View style={styles.titleRow}>
        <Text variant="headlineMedium" style={styles.screenTitle}>Teams</Text>
        <View style={styles.actionButtonsContainer}>
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <IconButton
              icon="dice-multiple"
              size={20}
              onPress={handleRandomTeams}
              disabled={sessionPlayers.length === 0}
              iconColor={sessionPlayers.length === 0 ? colors.onSurfaceDisabled : colors.secondary}
              style={styles.modernIconButton}
              rippleColor="transparent"
            />
            <IconButton
              icon="pencil"
              size={20}
              onPress={handleManualTeams}
              disabled={sessionPlayers.length === 0}
              iconColor={sessionPlayers.length === 0 ? colors.onSurfaceDisabled : colors.tertiary}
              style={styles.modernIconButton}
              rippleColor="transparent"
            />
          </View>
          
          {/* Settings and Clear */}
          <View style={styles.settingsContainer}>
            {teams.length > 0 && (
              <IconButton
                icon="delete-sweep"
                size={20}
                onPress={handleClearTeams}
                iconColor={colors.error}
                style={styles.modernIconButton}
                rippleColor="transparent"
              />
            )}
            <IconButton
              icon="cog"
              size={20}
              onPress={() => setSettingsDrawerVisible(true)}
              style={styles.modernIconButton}
              rippleColor="transparent"
            />
          </View>
        </View>
      </View>
      
      {/* Main Generate Button */}
      <View style={styles.generateContainer}>
        <Button 
          mode="contained" 
          disabled={sessionPlayers.length === 0} 
          style={styles.generateButton} 
          onPress={handleBalancedTeams}
          buttonColor={colors.primary}
          textColor={colors.onPrimary}
        >
          Generate Teams
        </Button>
      </View>
    </>
  );

  // Footer: team generation controls
  const renderFooter = () => (
    <View style={styles.controlsContainer}>
      {/* Footer content can be added here if needed */}
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top','left','right']}>
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          {renderHeader()}
        </View>
        
        {/* Scrollable Teams List */}
        <FlatList
          data={teams}
          keyExtractor={team => team.id}
          renderItem={({ item: team }) => (
                      <TeamCard
            team={team}
            onEditTeamName={handleEditTeamName}
            onMovePlayer={handleSwapPlayer}
            onRemovePlayer={handleRemovePlayerFromTeam}
            getTeamAvgSkill={getTeamAvgSkill}
          />
          )}
          ListEmptyComponent={<View style={styles.teamsContainer}><Text>Teams will appear here after generation.</Text></View>}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingTop: 8, 
            paddingHorizontal: SCREEN_MARGIN,
            paddingBottom: sessionDrawerVisible ? 200 : 20 // Add space for drawer
          }}
        />
      <Portal>
        <Dialog visible={swapDialogVisible} onDismiss={() => setSwapDialogVisible(false)} style={[{ backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
          <Dialog.Title style={{ color: colors.onBackground }}>Swap Players</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.onBackground, marginBottom: 16 }}>
              Select a player to swap with {swapPlayer?.player.firstName}{swapPlayer?.player.lastName ? ` ${swapPlayer.player.lastName}` : ''}
            </Text>
            {swapTargetPlayer && (
              <View style={{ 
                backgroundColor: colors.primaryContainer, 
                padding: 16, 
                borderRadius: 12, 
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary
              }}>
                <Text style={{ color: colors.onBackground, fontWeight: 'bold', marginBottom: 8 }}>
                  Swap Preview:
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, marginRight: 8 }}>{swapPlayer?.player.emoji || '👤'}</Text>
                    <View>
                      <Text style={{ color: colors.onBackground, fontWeight: '500' }}>
                        {swapPlayer?.player.firstName}{swapPlayer?.player.lastName ? ` ${swapPlayer.player.lastName}` : ''}
                      </Text>
                      <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
                        {skillLevelEmojis[swapPlayer?.player.skillLevel || 'New']} {swapPlayer?.player.skillLevel}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 20 }}>↔</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, marginRight: 8 }}>{swapTargetPlayer.player.emoji || '👤'}</Text>
                    <View>
                      <Text style={{ color: colors.onBackground, fontWeight: '500' }}>
                        {swapTargetPlayer.player.firstName}{swapTargetPlayer.player.lastName ? ` ${swapTargetPlayer.player.lastName}` : ''}
                      </Text>
                      <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
                        {skillLevelEmojis[swapTargetPlayer.player.skillLevel]} {swapTargetPlayer.player.skillLevel}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            <ScrollView style={{ maxHeight: 300 }}>
              {getOtherTeamPlayers(swapPlayer?.fromTeamId || '').length === 0 ? (
                <Text style={{ color: colors.onBackground, textAlign: 'center', fontStyle: 'italic', opacity: 0.6, padding: 20 }}>
                  No other players available to swap with
                </Text>
              ) : (
                getOtherTeamPlayers(swapPlayer?.fromTeamId || '').map(({ player, teamId, teamName, teamAvgSkill }) => (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => setSwapTargetPlayer({ player, teamId })}
                    style={[
                      styles.modernSwapItem,
                      { 
                        backgroundColor: swapTargetPlayer?.player.id === player.id ? colors.primaryContainer : colors.surface,
                        borderColor: swapTargetPlayer?.player.id === player.id ? colors.primary : colors.outline
                      }
                    ]}
                  >
                    <View style={styles.swapItemHeader}>
                      <View style={styles.swapItemLeft}>
                        <Text style={{ fontSize: 24, marginRight: 12 }}>{player.emoji || '👤'}</Text>
                        <View style={styles.swapItemInfo}>
                          <Text style={[styles.swapItemName, { color: colors.onBackground }]}>
                            {player.firstName}{player.lastName ? ` ${player.lastName}` : ''}
                          </Text>
                                                     <View style={styles.swapItemDetails}>
                             <View style={[styles.teamBadge, { backgroundColor: COLOR_MAP[teamName] || colors.outline }]}>
                               <Text style={[styles.teamBadgeText, { color: colors.onPrimary }]}>{teamName}</Text>
                             </View>
                             <Text style={[styles.skillText, { color: colors.onSurfaceVariant }]}>
                               Team Avg: {teamAvgSkill}
                             </Text>
                           </View>
                         </View>
                       </View>
                       <View style={styles.swapItemRight}>
                         <Text style={[styles.avgSkillText, { color: colors.onSurfaceVariant }]}>
                           {skillLevelEmojis[player.skillLevel]} {player.skillLevel}
                         </Text>
                        <RadioButton
                          value={player.id}
                          status={swapTargetPlayer?.player.id === player.id ? 'checked' : 'unchecked'}
                          onPress={() => setSwapTargetPlayer({ player, teamId })}
                          color={colors.primary}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSwapDialogVisible(false)} textColor={colors.error}>Cancel</Button>
            <Button onPress={confirmSwapPlayer} disabled={!swapTargetPlayer} textColor={colors.secondary}>Swap</Button>
          </Dialog.Actions>
        </Dialog>
        <Modal visible={manualModalVisible} onDismiss={handleCancelManualTeams} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={sharedStyles.modalHeader}>
              <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Manual Team Assignment</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={handleCancelManualTeams}
                style={sharedStyles.closeButton}
              />
            </View>
            <ScrollView 
              keyboardShouldPersistTaps="never" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={sharedStyles.modalContentStyle}
              style={sharedStyles.modalScrollView}
            >
              
              {/* Unassigned Players Section */}
              <Text variant="titleMedium" style={{ marginBottom: 8, marginTop: 16 }}>Unassigned Players</Text>
              {unassignedPlayers.length === 0 ? (
                <Text style={{ fontStyle: 'italic', opacity: 0.6, marginBottom: 16 }}>All players are assigned to teams</Text>
              ) : (
                <View style={[styles.unassignedContainer, { backgroundColor: colors.surface, padding: 12, marginBottom: 16 }, sharedStyles.cardBorderRadius]}>
                  {/* Frozen column layout with horizontal scrolling */}
                  <View style={styles.tableContainer}>
                    {/* Fixed player name column */}
                    <View style={styles.fixedColumn}>
                      {/* Header */}
                      <View style={[styles.teamHeaders, { borderRightWidth: 1, borderRightColor: colors.outline, borderBottomColor: colors.outline }]}>
                        <Text style={{ width: 120, fontSize: 14, fontWeight: 'bold' }}>Player</Text>
                      </View>
                      {/* Player rows */}
                      {unassignedPlayers.map(player => (
                        <View key={player.id} style={[styles.tableRow, { borderRightWidth: 1, borderRightColor: colors.outline }]}>
                          <View style={{ width: 120, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
                            <Text style={{ fontSize: 20, marginRight: 8 }}>{player.emoji || '👤'}</Text>
                            <Text 
                              style={{ flex: 1 }} 
                              numberOfLines={1} 
                              ellipsizeMode="tail"
                            >
                              {player.firstName}{player.lastName ? ` ${player.lastName}` : ''}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                    
                    {/* Scrollable team columns */}
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.scrollableColumns}
                    >
                      <View style={{ minWidth: Math.max(200, manualTeams.length * 50) }}>
                        {/* Team headers */}
                        <View style={styles.teamHeaders}>
                          {manualTeams.map((team, index) => (
                            <Text key={team.id} style={[styles.teamHeaderText, { width: 50 }]}>
                              {index + 1}
                            </Text>
                          ))}
                        </View>
                        {/* Team buttons */}
                        {unassignedPlayers.map(player => (
                          <View key={player.id} style={styles.tableRow}>
                            <View style={{ flexDirection: 'row' }}>
                              {manualTeams.map((team, index) => (
                                <View key={team.id} style={{ width: 50, alignItems: 'center' }}>
                                  <IconButton
                                    icon="plus"
                                    size={16}
                                    onPress={() => handleAssignPlayerToTeam(player.id, team.id)}
                                    style={{ marginHorizontal: 2 }}
                                  />
                                </View>
                              ))}
                            </View>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              )}
              
              {/* Teams Section */}
              <Text variant="titleMedium" style={{ marginBottom: 8, marginTop: 16 }}>Teams</Text>
              {manualTeams.map((team, index) => (
                <View key={team.id} style={[styles.manualTeamCard, { backgroundColor: colors.surface, padding: 12, marginBottom: 12 }, sharedStyles.cardBorderRadius]}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>Team {index + 1}: {team.name}</Text>
                  {team.players.length === 0 ? (
                    <Text style={{ fontStyle: 'italic', opacity: 0.6 }}>No players assigned</Text>
                  ) : (
                    team.players.map(player => (
                      <View key={player.id} style={styles.manualPlayerItem}>
                        <Text style={{ fontSize: 20, marginRight: 8 }}>{player.emoji || '👤'}</Text>
                        <Text 
                          style={{ flex: 1 }} 
                          numberOfLines={1} 
                          ellipsizeMode="tail"
                        >
                          {player.firstName}{player.lastName ? ` ${player.lastName}` : ''}
                        </Text>
                        <IconButton
                          icon="close"
                          size={16}
                          onPress={() => handleRemovePlayerFromManualTeam(player.id, team.id)}
                        />
                      </View>
                    ))
                  )}
                </View>
              ))}
              
              <View style={{ marginTop: 16 }}>
                <Button mode="contained" onPress={handleConfirmManualTeams} style={[{ marginBottom: 12 }, sharedStyles.cardBorderRadius]} buttonColor={colors.primary} textColor={colors.onPrimary}>
                  Confirm Teams
                </Button>
                <Button mode="outlined" onPress={handleCancelManualTeams} style={[{ borderColor: colors.error }, sharedStyles.cardBorderRadius]} textColor={colors.error}>
                  Cancel
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
        <SettingsDrawer
          visible={settingsDrawerVisible}
          onDismiss={() => setSettingsDrawerVisible(false)}
          onSave={handleSaveSettings}
          settings={{
            weights: settings.weights ?? {
              skillLevel: 3,
              teammatePreference: 2,
              teamSizePreference: 1
            },
            darkMode: settings.darkMode ?? false
          }}
        />
        <Modal 
          visible={newPlayerModalVisible} 
          onDismiss={() => setNewPlayerModalVisible(false)} 
          contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={sharedStyles.modalHeader}>
              <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Add New Player</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setNewPlayerModalVisible(false)}
                style={sharedStyles.closeButton}
              />
            </View>
            <ScrollView 
              keyboardShouldPersistTaps="never" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={sharedStyles.modalContentStyle}
              style={sharedStyles.modalScrollView}
            >
              <PlayerForm
                onSubmit={handleAddNewPlayer}
                onCancel={handleCancelNewPlayer}
                title="Add New Player"
                submitLabel="Save Player"
                hideHeader={true}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
      
      {/* Session Drawer */}
      {sessionDrawerVisible && (
        <GestureDetector gesture={panGesture}>
          <Surface 
            style={[
              styles.sessionDrawer, 
              { 
                backgroundColor: colors.primary,
                transform: [{ translateY: drawerTranslateY }]
              }
            ]}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setDrawerHeight(height);
            }}
          >
            {/* Drawer Tab Indicator */}
            <View style={styles.drawerTab}>
              <View style={[styles.drawerTabHandle, { backgroundColor: colors.onSurfaceVariant }]} />
            </View>
            
                          <View 
                style={[styles.drawerHeader]}
                onLayout={(event: any) => {
                  const { height } = event.nativeEvent.layout;
                  setMinDrawerHeight(height);
                }}
              >
              <View style={styles.drawerTitleContainer}>
                {sessionPlayers.length === 0 && (
                  <Text variant="titleMedium" style={[styles.drawerTitle, { color: colors.onPrimary }]}>
                    Current Session
                  </Text>
                )}
                <Text style={[styles.drawerSubtitle, { color: colors.onPrimary }]}>
                  {sessionPlayers.length} player{sessionPlayers.length !== 1 ? 's' : ''} • {numberOfTeams} team{numberOfTeams !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            
            {sessionDrawerExpanded && (
              <ScrollView 
                style={styles.drawerContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <View style={[styles.teamsRow, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.teamsLabel, { color: colors.onPrimaryContainer }]}>Teams for this session:</Text>
                  <IconButton icon="minus" size={20} onPress={() => setNumberOfTeams(Math.max(1, numberOfTeams - 1))} />
                  <Text style={[styles.teamsValue, { color: colors.onPrimaryContainer }]}>{numberOfTeams}</Text>
                  <IconButton icon="plus" size={20} onPress={() => setNumberOfTeams(numberOfTeams + 1)} />
                </View>
                
                {/* Group Filter */}
                <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
                  <Text variant="titleMedium" style={{ color: colors.onPrimary, marginBottom: 8 }}>Filter by Group</Text>
                  <GroupSelector
                    groups={[]} // Pass empty array since GroupSelector now uses getAllGroups internally
                    selectedGroupIds={selectedGroupFilter}
                    onSelectGroup={handleSelectGroupFilter}
                    style={{ marginVertical: 0 }}
                    multiSelect={true}
                    inverseColors={true}
                  />
                </View>
                
                {/* Player Selection */}
                <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                  <View style={styles.selectHeader}>
                    <Text variant="titleMedium" style={{ color: colors.onPrimary }}>Select Players</Text>
                    {availablePlayers.length > 0 && (
                      <TouchableOpacity
                        style={[
                          styles.selectAllButton,
                          { 
                            backgroundColor: 'transparent'
                          }
                        ]}
                        onPress={() => {
                          const availableInSession = availablePlayers.filter(p => sessionPlayerIds.includes(p.id));
                          if (availableInSession.length === availablePlayers.length) {
                            handleUnselectAllAvailable();
                          } else {
                            handleSelectAllAvailable();
                          }
                        }}
                      >
                        <Text style={[styles.selectAllButtonText, { color: colors.onPrimary }]}>
                          {availablePlayers.filter(p => sessionPlayerIds.includes(p.id)).length === availablePlayers.length ? 'Clear' : 'Select All'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <MultiSelectTabs
                    items={availablePlayers.map(player => ({
                      id: player.id,
                      label: `${player.firstName}${player.lastName ? ` ${player.lastName}` : ''}`,
                      emoji: player.emoji || '👤'
                    }))}
                    selectedIds={sessionPlayerIds}
                    onToggleItem={handleTogglePlayerSelection}
                    style={{ marginBottom: 8 }}
                    showAddButton={true}
                    onAddPress={() => setNewPlayerModalVisible(true)}
                    addButtonLabel="Add Player"
                    addButtonEmoji="➕"
                    inverseColors={true}
                  />
                </View>
              </ScrollView>
            )}
          </Surface>
        </GestureDetector>
      )}
    </SafeAreaView>
    </GestureHandlerRootView>
  );
} 