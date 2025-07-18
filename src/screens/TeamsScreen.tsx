import * as React from 'react';
import { View, ScrollView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Portal, Modal, List, IconButton, Checkbox, Dialog, RadioButton, useTheme } from 'react-native-paper';
import { useAppState } from '../models/AppStateContext';
import { Player, COLOR_NAMES, SKILL_VALUES, Team } from '../models/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_MARGIN, SORT_OPTIONS } from '../utils/constants';
import { sharedStyles, screenHeight } from '../styles/shared';
import PlayerForm, { PlayerFormValues } from '../components/PlayerForm';
import TeamCard from '../components/TeamCard';
import SessionPlayersCard from '../components/SessionPlayersCard';
import SettingsModal from '../components/SettingsModal';
import TabSelector from '../components/TabSelector';
import { generateRandomTeams, generateBestTeamSet } from '../utils/teamGeneration';
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
  const [moveDialogVisible, setMoveDialogVisible] = React.useState(false);
  const [movePlayer, setMovePlayer] = React.useState<{ player: Player; fromTeamId: string } | null>(null);
  const [moveTargetTeamId, setMoveTargetTeamId] = React.useState<string>('');
  const [sessionCardExpanded, setSessionCardExpanded] = React.useState(true);
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

  // Team generation options for TabSelector
  const generationOptions = [
    { key: 'random', label: 'Random' },
    { key: 'balanced', label: 'Balanced' },
    { key: 'manual', label: 'Manual' }
  ];

  // Random Team Generation
  const handleRandomTeams = () => {
    const teamsArr = generateRandomTeams(players, sessionPlayerIds, numberOfNets, COLOR_NAMES);
    setTeams(teamsArr);
  };

  // Balanced Team Generation
  const handleBalancedTeams = () => {
    const weights = settings.weights ?? {skillLevel: 3, teammatePreference: 2, teamSizePreference: 1};
    const teamsArr = generateBestTeamSet(
      players.filter(p => sessionPlayerIds.includes(p.id)),
      { numberOfNets, weights },
      COLOR_NAMES,
      5
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

  const handleMovePlayer = (player: Player, fromTeamId: string) => {
    setMovePlayer({ player, fromTeamId });
    setMoveTargetTeamId('');
    setMoveDialogVisible(true);
  };

  const confirmMovePlayer = () => {
    if (!movePlayer || !moveTargetTeamId) return;
    // Remove from old team
    const updatedTeams = teams.map(t => {
      if (t.id === movePlayer.fromTeamId) {
        return { ...t, players: t.players.filter(p => p.id !== movePlayer.player.id) };
      }
      return t;
    }).map(t => {
      if (t.id === moveTargetTeamId) {
        return { ...t, players: [...t.players, movePlayer.player] };
      }
      return t;
    });
    setTeams(updatedTeams);
    setMoveDialogVisible(false);
    setMovePlayer(null);
    setMoveTargetTeamId('');
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
      
      <SessionPlayersCard
        sessionPlayers={sessionPlayers}
        numberOfNets={numberOfNets}
        setNumberOfNets={setNumberOfNets}
        isExpanded={sessionCardExpanded}
        setIsExpanded={setSessionCardExpanded}
        onAddPlayer={() => setModalVisible(true)}
        onRemovePlayer={handleRemoveFromSession}
        swipeableRefs={swipeableRefs}
      />
    </>
  );

  // Footer: team generation controls
  const renderFooter = () => (
    <View style={styles.controlsContainer}>
      {/* Footer content can be added here if needed */}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top','left','right']}>
      <FlatList
        data={teams}
        keyExtractor={team => team.id}
        renderItem={({ item: team }) => (
          <TeamCard
            team={team}
            onEditTeamName={handleEditTeamName}
            onMovePlayer={handleMovePlayer}
            onRemovePlayer={handleRemovePlayerFromTeam}
            onDragEnd={data => setTeams(teams.map(t => t.id === team.id ? { ...t, players: data } : t))}
            getTeamAvgSkill={getTeamAvgSkill}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingHorizontal: SCREEN_MARGIN }}
        ListEmptyComponent={<View style={styles.teamsContainer}><Text>Teams will appear here after generation.</Text></View>}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
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
                  <Button mode="contained" style={[{ marginBottom: 16 }, sharedStyles.cardBorderRadius]} onPress={handleAddSelected} disabled={selectedIds.length === 0} buttonColor={colors.primary} textColor={colors.onPrimary}>
                    Add to Session ({selectedIds.length})
                  </Button>
                  <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Players</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <Button mode="outlined" style={[{ flex: 1, marginRight: 8 }, sharedStyles.cardBorderRadius]} onPress={handleSelectAll} textColor={colors.secondary} >
                      Select All
                    </Button>
                    <Button mode="outlined" style={[{ flex: 1 }, sharedStyles.cardBorderRadius]} onPress={handleUnselectAll} textColor={colors.secondary} >
                      Unselect All
                    </Button>
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
        <Dialog visible={moveDialogVisible} onDismiss={() => setMoveDialogVisible(false)} style={[{ backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
          <Dialog.Title style={{ color: colors.onBackground }}>Move Player to Team</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setMoveTargetTeamId} value={moveTargetTeamId}>
              {teams.filter(t => t.id !== movePlayer?.fromTeamId).map(t => (
                <RadioButton.Item key={t.id} label={t.name} value={t.id} color={colors.primary} labelStyle={{ color: colors.onBackground }} />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMoveDialogVisible(false)} textColor={colors.error}>Cancel</Button>
            <Button onPress={confirmMovePlayer} disabled={!moveTargetTeamId} textColor={colors.secondary}>Move</Button>
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
    </SafeAreaView>
  );
} 