import * as React from 'react';
import { View, StyleSheet, Keyboard, Pressable, ScrollView, FlatList, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Card, FAB, Portal, Modal, List, IconButton, Checkbox, TextInput, Dialog, RadioButton, useTheme } from 'react-native-paper';
import { useAppState } from '../models/AppStateContext';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SkillLevel, Player, COLOR_NAMES, SKILL_VALUES, Team, COLOR_MAP } from '../models/types';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_MARGIN } from '../styles/constants';
import PlayerForm, { PlayerFormValues } from '../PlayerForm';
import TeamCard from '../components/TeamCard';
import SessionPlayersCard from '../components/SessionPlayersCard';

export default function TeamsScreen() {
  const { players, sessionPlayerIds, setSessionPlayerIds, teams, setTeams, setPlayers, numberOfNets, setNumberOfNets, settings } = useAppState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [moveDialogVisible, setMoveDialogVisible] = React.useState(false);
  const [movePlayer, setMovePlayer] = React.useState<{ player: Player; fromTeamId: string } | null>(null);
  const [moveTargetTeamId, setMoveTargetTeamId] = React.useState<string>('');
  // Modal mode: 'select' or 'add'
  const [modalMode, setModalMode] = React.useState<'select' | 'add'>('select');
  const { colors } = useTheme();
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});
  const [newPlayerModalVisible, setNewPlayerModalVisible] = React.useState(false);

  // Get session players
  const sessionPlayers = players.filter(p => sessionPlayerIds.includes(p.id));
  // Players not in session
  const availablePlayers = players.filter(p => !sessionPlayerIds.includes(p.id));

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

  // Random Team Generation
  const handleRandomTeams = () => {
    if (sessionPlayerIds.length === 0 || numberOfNets < 1) return;
    const numTeams = 2 * numberOfNets;
    const sessionPlayers = players.filter(p => sessionPlayerIds.includes(p.id));
    // Shuffle players
    const shuffled = [...sessionPlayers].sort(() => Math.random() - 0.5);
    // Get random color names
    const colorNames = getRandomColorNames(numTeams);
    // Split into teams
    const teamsArr = Array.from({ length: numTeams }, (_, i) => ({
      id: (i + 1).toString(),
      name: colorNames[i],
      players: [] as Player[],
    }));
    shuffled.forEach((player, idx) => {
      teamsArr[idx % numTeams].players.push(player);
    });
    setTeams(teamsArr);
  };

  // Balanced Team Generation
  const handleBalancedTeams = () => {
    if (sessionPlayerIds.length === 0 || numberOfNets < 1) return;
    const numTeams = 2 * numberOfNets;
    const sessionPlayers = players.filter(p => sessionPlayerIds.includes(p.id));
    // Step 1: Score Players
    const scoredPlayers = sessionPlayers.map(player => {
      // Team size preference: 1 if not 'Any', else 0
      const sizePreferenceScore = player.teamSizePreference && player.teamSizePreference !== 'Any' ? 1 : 0;
      // Position preference: 1 if not 'Any', else 0
      const positionScore = player.preferredPosition && player.preferredPosition !== 'Any' ? 1 : 0;
      const score =
        settings.skillWeight * SKILL_VALUES[player.skillLevel] +
        settings.sizeWeight * sizePreferenceScore +
        settings.positionWeight * positionScore;
      return { ...player, score };
    });
    // Step 2: Sort by score descending, randomize ties
    scoredPlayers.sort((a, b) => {
      if (b.score === a.score) return Math.random() - 0.5;
      return b.score - a.score;
    });
    // Get random color names
    const colorNames = getRandomColorNames(numTeams);
    // Step 3: Assign to teams with size constraint
    const teamsArr = Array.from({ length: numTeams }, (_, i) => ({
      id: (i + 1).toString(),
      name: colorNames[i],
      players: [] as Player[],
    }));
    for (const player of scoredPlayers) {
      // Find the minimum team size so far
      const minTeamSize = Math.min(...teamsArr.map(t => t.players.length));
      // Only consider teams whose size is <= minTeamSize + 1
      let bestTeamIdx = 0;
      let minAvg = Infinity;
      let minSize = Infinity;
      for (let i = 0; i < teamsArr.length; i++) {
        const t = teamsArr[i];
        if (t.players.length > minTeamSize + 1) continue;
        const avg = t.players.length === 0 ? 0 : t.players.reduce((sum, p) => sum + SKILL_VALUES[p.skillLevel], 0) / t.players.length;
        if (
          avg < minAvg ||
          (avg === minAvg && t.players.length < minSize)
        ) {
          minAvg = avg;
          minSize = t.players.length;
          bestTeamIdx = i;
        }
      }
      teamsArr[bestTeamIdx].players.push(player);
    }
    setTeams(teamsArr);
  };

  const handleRemoveFromSession = (id: string) => {
    setSessionPlayerIds(sessionPlayerIds.filter(pid => pid !== id));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(selectedIds.includes(id)
      ? selectedIds.filter(pid => pid !== id)
      : [...selectedIds, id]);
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

  // Header: nets control and session player list
  const renderHeader = () => (
    <>
      <View style={styles.netsRow}>
        <Text style={styles.netsLabel}>Nets for this session:</Text>
        <IconButton icon="minus" size={20} onPress={() => setNumberOfNets(Math.max(1, numberOfNets - 1))} />
        <Text style={styles.netsValue}>{numberOfNets}</Text>
        <IconButton icon="plus" size={20} onPress={() => setNumberOfNets(numberOfNets + 1)} />
      </View>
      <SessionPlayersCard
        sessionPlayers={sessionPlayers}
        onAddPlayer={() => setModalVisible(true)}
        onRemovePlayer={handleRemoveFromSession}
        swipeableRefs={swipeableRefs}
      />
    </>
  );

  // Footer: team generation controls
  const renderFooter = () => (
    <View style={styles.controlsContainer}>
      {teams.length > 0 && (
        <Button mode="outlined" style={{ marginBottom: 12 }} onPress={handleClearTeams}>
          Clear Teams
        </Button>
      )}
      <Button mode="contained" disabled={sessionPlayers.length === 0} style={styles.controlButton} onPress={handleRandomTeams}>
        Random
      </Button>
      <Button mode="contained" disabled={sessionPlayers.length === 0} style={styles.controlButton} onPress={handleBalancedTeams}>
        Balanced
      </Button>
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
        <Modal visible={modalVisible} onDismiss={() => { setModalVisible(false); setSelectedIds([]); setModalMode('select'); }} contentContainerStyle={[styles.modal, { backgroundColor: colors.background, borderRadius: 20 }]}> 
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView keyboardShouldPersistTaps="never">
              {modalMode === 'select' ? (
                <>
                  <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Players</Text>
                  {availablePlayers.length === 0 ? (
                    <Text>No available players. Add a new player below.</Text>
                  ) : (
                    availablePlayers.map(player => (
                      <List.Item
                        key={player.id}
                        title={`${player.firstName} ${player.lastName}`}
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
                  <Button mode="outlined" style={{ marginTop: 12 }} onPress={() => setModalMode('add')}>
                    Add New Player
                  </Button>
                  <Button mode="contained" style={{ marginTop: 12 }} onPress={handleAddSelected} disabled={selectedIds.length === 0}>
                    Add to Session
                  </Button>
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
        <Dialog visible={moveDialogVisible} onDismiss={() => setMoveDialogVisible(false)} style={{ backgroundColor: colors.background, borderRadius: 20 }}>
          <Dialog.Title style={{ color: colors.onBackground }}>Move Player to Team</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setMoveTargetTeamId} value={moveTargetTeamId}>
              {teams.filter(t => t.id !== movePlayer?.fromTeamId).map(t => (
                <RadioButton.Item key={t.id} label={t.name} value={t.id} color={colors.primary} labelStyle={{ color: colors.onBackground }} />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMoveDialogVisible(false)} textColor={colors.primary}>Cancel</Button>
            <Button onPress={confirmMovePlayer} disabled={!moveTargetTeamId} textColor={colors.primary}>Move</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sessionCard: { marginBottom: 16 },
  addButton: { marginRight: 8 },
  modal: { padding: 20, margin: 20 },
  teamsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controlsContainer: { flexDirection: 'column', alignItems: 'stretch', marginVertical: 0 },
  controlButton: { marginVertical: 4, marginBottom: 8 },
  swipeAction: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'red', width: 64 },
  input: { marginBottom: 12 },
  teamCard: { marginVertical: 8 },
  teamNameInput: { fontSize: 18, fontWeight: 'bold', backgroundColor: 'transparent' },
  skillBadge: { backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, marginRight: 8 },
  netsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'center' },
  netsLabel: { fontWeight: 'bold', marginRight: 8 },
  netsValue: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 8, minWidth: 24, textAlign: 'center' },
  swipeActionRow: { flexDirection: 'row', alignItems: 'center', height: '100%', backgroundColor: 'red' },
  formContainer: { marginBottom: 16 },
  buttonContainer: { marginBottom: 12 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
}); 