import * as React from 'react';
import { View, ScrollView, FlatList, KeyboardAvoidingView, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Modal, List, IconButton, Checkbox, Dialog, RadioButton, useTheme, Surface } from 'react-native-paper';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useAppState } from '../models/AppStateContext';
import { Player, COLOR_NAMES, SKILL_VALUES, Team } from '../models/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_MARGIN, SORT_OPTIONS } from '../utils/constants';
import { sharedStyles, screenHeight } from '../styles/shared';
import PlayerForm, { PlayerFormValues } from '../components/PlayerForm';
import TeamCard from '../components/TeamCard';
import SettingsModal from '../components/SettingsModal';
import TabSelector from '../components/TabSelector';
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
  const { players, sessionPlayerIds, setSessionPlayerIds, teams, setTeams, setPlayers, numberOfNets, setNumberOfNets, settings, setSettings } = useAppState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
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
  const [generationMode, setGenerationMode] = React.useState<'random' | 'balanced' | 'manual'>('balanced');
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  // Modal mode: 'select' or 'add'
  const [modalMode, setModalMode] = React.useState<'select' | 'add'>('select');
  const { colors } = useTheme();
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});
  const [newPlayerModalVisible, setNewPlayerModalVisible] = React.useState(false);

  // Get session players
  const sessionPlayers = players.filter(p => sessionPlayerIds.includes(p.id));
  // Players not in session
  const availablePlayers = players.filter(p => !sessionPlayerIds.includes(p.id));

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

  // Gesture handler for drawer swipe
  const onGestureEvent = React.useCallback((event: any) => {
    const { translationY } = event.nativeEvent;
    const maxTranslateY = drawerHeight - minDrawerHeight;
    const newTranslateY = Math.max(0, Math.min(maxTranslateY, translationY));
    setDrawerTranslateY(newTranslateY);
  }, [drawerHeight, minDrawerHeight]);

  // Handle swipe up to expand when collapsed
  const onGestureEventUp = React.useCallback((event: any) => {
    const { translationY } = event.nativeEvent;
    if (translationY < 0 && !sessionDrawerExpanded) {
      // Swiping up when collapsed - expand the drawer
      setSessionDrawerExpanded(true);
      setDrawerTranslateY(0);
    }
  }, [sessionDrawerExpanded]);

  const onHandlerStateChange = React.useCallback((event: any) => {
    const { state, translationY } = event.nativeEvent;
    
    if (state === State.END) {
      const threshold = (drawerHeight - minDrawerHeight) / 2;
      const shouldCollapse = translationY > threshold;
      
      if (shouldCollapse) {
        setSessionDrawerExpanded(false);
      } else {
        setSessionDrawerExpanded(true);
      }
      setDrawerTranslateY(0);
    }
  }, [drawerHeight, minDrawerHeight]);

  // Team generation options for TabSelector
  const generationOptions = [
    { key: 'random', label: 'Random' },
    { key: 'balanced', label: 'Balanced' },
    { key: 'manual', label: 'Manual' }
  ];

  // Random Team Generation
  const handleRandomTeams = () => {
    const teamsArr = generateRandomTeams(players.filter(p => sessionPlayerIds.includes(p.id)), numberOfNets, COLOR_NAMES);
    setTeams(teamsArr);
  };

  // Balanced Team Generation
  const handleBalancedTeams = () => {
    const weights = settings.weights ?? {skillLevel: 3, teammatePreference: 2, teamSizePreference: 1};
    const teamsArr = generateSnakeDraftTeams(
      players.filter(p => sessionPlayerIds.includes(p.id)),
      { numberOfNets, weights },
      COLOR_NAMES
    );
    setTeams(teamsArr);
  };

  // Manual Team Generation
  const handleManualTeams = () => {
    const teamCount = 2 * numberOfNets;
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
  };

  const handleCancelManualTeams = () => {
    setManualModalVisible(false);
    setManualTeams([]);
    setUnassignedPlayers([]);
  };

  const handleRemoveFromSession = (id: string) => {
    setSessionPlayerIds(sessionPlayerIds.filter(pid => pid !== id));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(selectedIds.includes(id)
      ? selectedIds.filter(pid => pid !== id)
      : [...selectedIds, id]);
  };

  const handleSelectAll = () => {
    setSelectedIds(availablePlayers.map(p => p.id));
  };

  const handleUnselectAll = () => {
    setSelectedIds([]);
  };

  const handleAddSelected = () => {
    setSessionPlayerIds([...sessionPlayerIds, ...selectedIds]);
    setModalVisible(false);
    setSelectedIds([]);
  };

  const handleAddNewPlayer = (data: PlayerFormValues) => {
    const id = Math.random().toString(36).slice(2, 10);
    const player = { id, ...data };
    setPlayers([...players, player]);
    setSessionPlayerIds([...sessionPlayerIds, id]);
    setNewPlayerModalVisible(false);
    setModalMode('select');
  };

  const handleCancelNewPlayer = () => {
    setNewPlayerModalVisible(false);
    setModalMode('select');
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
    console.log('Clearing teams...');
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
  const getOtherTeamPlayers = (excludeTeamId: string): Array<{ player: Player; teamId: string; teamName: string }> => {
    const otherPlayers: Array<{ player: Player; teamId: string; teamName: string }> = [];
    teams.forEach(team => {
      if (team.id !== excludeTeamId) {
        team.players.forEach(player => {
          otherPlayers.push({ player, teamId: team.id, teamName: team.name });
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

  // Team Generation Handler
  const handleGenerateTeams = () => {
    switch (generationMode) {
      case 'random':
        handleRandomTeams();
        break;
      case 'balanced':
        handleBalancedTeams();
        break;
      case 'manual':
        handleManualTeams();
        break;
    }
  };

  const getGenerationModeLabel = () => {
    switch (generationMode) {
      case 'random': return 'Random';
      case 'balanced': return 'Balanced';
      case 'manual': return 'Manual';
      default: return 'Balanced';
    }
  };

  // Settings handlers
  const handleSaveSettings = (newSettings: { weights: { skillLevel: number; teammatePreference: number; teamSizePreference: number }; darkMode: boolean }) => {
    setSettings(newSettings);
  };

  // Header: nets control and session player list
  const renderHeader = () => (
    <>
      {/* Title and Settings Row */}
      <View style={styles.titleRow}>
        <Text variant="headlineMedium" style={styles.screenTitle}>Teams</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {teams.length > 0 && (
            <IconButton
              icon="delete-sweep"
              size={24}
              onPress={handleClearTeams}
              iconColor={colors.error}
              style={styles.settingsButton}
            />
          )}
          <IconButton
            icon="cog"
            size={24}
            onPress={() => setSettingsModalVisible(true)}
            style={styles.settingsButton}
          />
        </View>
      </View>
      
      {/* Team Generation Controls */}
      <View style={styles.generationContainer}>
        <TabSelector
          options={generationOptions}
          selectedKey={generationMode}
          onSelect={(key) => setGenerationMode(key as 'random' | 'balanced' | 'manual')}
          style={styles.tabSelector}
        />
        <Button 
          mode="contained" 
          disabled={sessionPlayers.length === 0} 
          style={styles.generateButton} 
          onPress={handleGenerateTeams}
          buttonColor={colors.primary}
          textColor={colors.onPrimary}
        >
          Generate Teams ({getGenerationModeLabel()})
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
      <FlatList
        data={teams}
        keyExtractor={team => team.id}
        renderItem={({ item: team }) => (
          <TeamCard
            team={team}
            onEditTeamName={handleEditTeamName}
            onMovePlayer={handleSwapPlayer}
            onRemovePlayer={handleRemovePlayerFromTeam}
            onDragEnd={data => setTeams(teams.map(t => t.id === team.id ? { ...t, players: data } : t))}
            getTeamAvgSkill={getTeamAvgSkill}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
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
        <Modal visible={modalVisible} onDismiss={() => { setModalVisible(false); setSelectedIds([]); setModalMode('select'); }} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}> 
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={sharedStyles.modalHeader}>
              <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Add Players to Session</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => { setModalVisible(false); setSelectedIds([]); setModalMode('select'); }}
                style={sharedStyles.closeButton}
              />
            </View>
            <ScrollView 
              keyboardShouldPersistTaps="never" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={sharedStyles.modalContentStyle}
              style={sharedStyles.modalScrollView}
            >
              {modalMode === 'select' ? (
                <>
                  <Button 
                    mode="outlined" 
                    style={[{ marginBottom: 16 }, sharedStyles.cardBorderRadius]} 
                    onPress={handleAddSelected} 
                    disabled={selectedIds.length === 0} 
                    textColor={colors.primary}
                  >
                    Add to Session ({selectedIds.length})
                  </Button>
                  <View style={styles.selectHeader}>
                    <Text variant="titleMedium" style={{ color: colors.onBackground }}>Select Players</Text>
                    <TouchableOpacity
                      style={styles.selectAllContainer}
                      onPress={() => {
                        if (selectedIds.length === availablePlayers.length) {
                          handleUnselectAll();
                        } else {
                          handleSelectAll();
                        }
                      }}
                    >
                      <Checkbox
                        status={selectedIds.length === availablePlayers.length && availablePlayers.length > 0 ? 'checked' : 'unchecked'}
                        disabled={true}
                        color={colors.primary}
                      />
                      <Text style={[styles.selectAllText, { color: colors.onSurfaceVariant }]}>
                        {selectedIds.length === availablePlayers.length && availablePlayers.length > 0 ? 'Unselect All' : 'Select All'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {availablePlayers.length === 0 ? (
                    <Text>No available players. Add a new player below.</Text>
                  ) : (
                    availablePlayers.map(player => (
                      <List.Item
                        key={player.id}
                        title={`${player.firstName}${player.lastName ? ` ${player.lastName}` : ''}`}
                        left={props => (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 24, marginRight: 8 }}>{player.emoji || '👤'}</Text>
                            <Checkbox
                              status={selectedIds.includes(player.id) ? 'checked' : 'unchecked'}
                              onPress={() => handleToggleSelect(player.id)}
                            />
                          </View>
                        )}
                        onPress={() => handleToggleSelect(player.id)}
                      />
                    ))
                  )}
                  <View style={{ alignItems: 'center', marginTop: 16 }}>
                    <IconButton
                      icon="plus"
                      size={32}
                      onPress={() => setModalMode('add')}
                      style={{ margin: 0 }}
                    />
                  </View>
                </>
              ) : (
                <PlayerForm
                  onSubmit={handleAddNewPlayer}
                  onCancel={handleCancelNewPlayer}
                  title="Add New Player"
                  submitLabel="Save Player"
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
        <Dialog visible={swapDialogVisible} onDismiss={() => setSwapDialogVisible(false)} style={[{ backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
          <Dialog.Title style={{ color: colors.onBackground }}>Swap Players</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.onBackground, marginBottom: 16 }}>
              Select a player to swap with {swapPlayer?.player.firstName}{swapPlayer?.player.lastName ? ` ${swapPlayer.player.lastName}` : ''}
            </Text>
            {swapTargetPlayer && (
              <View style={{ 
                backgroundColor: colors.primaryContainer, 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary
              }}>
                <Text style={{ color: colors.onBackground, fontWeight: 'bold', marginBottom: 4 }}>
                  Swap Preview:
                </Text>
                <Text style={{ color: colors.onBackground }}>
                  {swapPlayer?.player.firstName}{swapPlayer?.player.lastName ? ` ${swapPlayer.player.lastName}` : ''} ↔ {swapTargetPlayer.player.firstName}{swapTargetPlayer.player.lastName ? ` ${swapTargetPlayer.player.lastName}` : ''}
                </Text>
              </View>
            )}
            <ScrollView style={{ maxHeight: 300 }}>
              {getOtherTeamPlayers(swapPlayer?.fromTeamId || '').length === 0 ? (
                <Text style={{ color: colors.onBackground, textAlign: 'center', fontStyle: 'italic', opacity: 0.6, padding: 20 }}>
                  No other players available to swap with
                </Text>
              ) : (
                getOtherTeamPlayers(swapPlayer?.fromTeamId || '').map(({ player, teamId, teamName }) => (
                  <List.Item
                    key={player.id}
                    title={`${player.firstName}${player.lastName ? ` ${player.lastName}` : ''}`}
                    description={`${teamName} Team`}
                    left={props => (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, marginRight: 8 }}>{player.emoji || '👤'}</Text>
                        <RadioButton
                          value={player.id}
                          status={swapTargetPlayer?.player.id === player.id ? 'checked' : 'unchecked'}
                          onPress={() => setSwapTargetPlayer({ player, teamId })}
                          color={colors.primary}
                        />
                      </View>
                    )}
                    onPress={() => setSwapTargetPlayer({ player, teamId })}
                    style={{ backgroundColor: swapTargetPlayer?.player.id === player.id ? colors.primaryContainer : 'transparent' }}
                  />
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
                  {/* Team number headers */}
                  <View style={styles.teamHeaders}>
                    <Text style={{ flex: 1, fontSize: 14, fontWeight: 'bold' }}>Player</Text>
                    {manualTeams.map((team, index) => (
                      <Text key={team.id} style={styles.teamHeaderText}>
                        {index + 1}
                      </Text>
                    ))}
                  </View>
                  {unassignedPlayers.map(player => (
                    <View key={player.id} style={styles.manualPlayerItem}>
                      <Text style={{ fontSize: 20, marginRight: 8 }}>{player.emoji || '👤'}</Text>
                      <Text 
                        style={{ flex: 1 }} 
                        numberOfLines={1} 
                        ellipsizeMode="tail"
                      >
                        {player.firstName}{player.lastName ? ` ${player.lastName}` : ''}
                      </Text>
                      <View style={{ flexDirection: 'row' }}>
                        {manualTeams.map((team, index) => (
                          <IconButton
                            key={team.id}
                            icon="plus"
                            size={16}
                            onPress={() => handleAssignPlayerToTeam(player.id, team.id)}
                            style={{ marginHorizontal: 2 }}
                          />
                        ))}
                      </View>
                    </View>
                  ))}
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
        <SettingsModal
          visible={settingsModalVisible}
          onDismiss={() => setSettingsModalVisible(false)}
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
      </Portal>
      
      {/* Session Drawer */}
      {sessionDrawerVisible && (
        <PanGestureHandler
          onGestureEvent={(event) => {
            onGestureEvent(event);
            onGestureEventUp(event);
          }}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Surface 
            style={[
              styles.sessionDrawer, 
              { 
                backgroundColor: colors.surface,
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
              style={styles.drawerHeader}
              onLayout={(event: any) => {
                const { height } = event.nativeEvent.layout;
                setMinDrawerHeight(height);
              }}
            >
              <View style={styles.drawerTitleContainer}>
                <Text variant="titleMedium" style={[styles.drawerTitle, { color: colors.onSurface }]}>
                  Current Session
                </Text>
                <Text style={[styles.drawerSubtitle, { color: colors.onSurfaceVariant }]}>
                  {sessionPlayers.length} player{sessionPlayers.length !== 1 ? 's' : ''} • {numberOfNets} net{numberOfNets !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            
            {sessionDrawerExpanded && (
              <ScrollView 
                style={styles.drawerContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <View style={styles.netsRow}>
                  <Text style={[styles.netsLabel, { color: colors.onSurface }]}>Nets for this session:</Text>
                  <IconButton icon="minus" size={20} onPress={() => setNumberOfNets(Math.max(1, numberOfNets - 1))} />
                  <Text style={[styles.netsValue, { color: colors.onSurface }]}>{numberOfNets}</Text>
                  <IconButton icon="plus" size={20} onPress={() => setNumberOfNets(numberOfNets + 1)} />
                </View>
                
                <View style={styles.playersSection}>
                  <View style={styles.playersHeader}>
                    <Text style={[styles.playersTitle, { color: colors.onSurface }]}>Session Players</Text>
                    <IconButton
                      icon="plus"
                      size={24}
                      onPress={() => setModalVisible(true)}
                      style={styles.addButton}
                    />
                  </View>
                  
                  {sessionPlayers.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                      No players selected for this session.
                    </Text>
                  ) : (
                    sessionPlayers.map(player => (
                      <View key={player.id} style={styles.playerItem}>
                        <Text style={{ fontSize: 20, marginRight: 8 }}>{player.emoji || '👤'}</Text>
                        <Text style={[styles.playerName, { color: colors.onSurface }]}>
                          {player.firstName}{player.lastName ? ` ${player.lastName}` : ''}
                        </Text>
                        <IconButton
                          icon="close"
                          size={20}
                          onPress={() => handleRemoveFromSession(player.id)}
                          iconColor={colors.error}
                        />
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            )}
          </Surface>
        </PanGestureHandler>
      )}
    </SafeAreaView>
    </GestureHandlerRootView>
  );
} 