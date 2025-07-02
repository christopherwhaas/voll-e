import * as React from 'react';
import { View, StyleSheet, Keyboard, Pressable, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, List, FAB, Portal, Modal, IconButton, Button, TextInput, Menu, useTheme } from 'react-native-paper';
import { useAppState } from '../models/AppStateContext';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import PlayerForm, { PlayerFormValues } from '../PlayerForm';
import { SkillLevel, TeamSize, Position, EMOJI_LIST } from '../models/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_MARGIN } from '../styles/constants';
import PlayerListItem from '../components/PlayerListItem';

const skillLevels: SkillLevel[] = ['New', 'Beginner', 'Intermediate', 'Advanced', 'Jules'];
const teamSizes: TeamSize[] = ['Any', 'Small', 'Large'];
const positions: Position[] = ['Any', 'Hitter', 'Setter', 'Libero', 'Blocker'];

export default function PlayersScreen() {
  const { players, setPlayers } = useAppState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editPlayerId, setEditPlayerId] = React.useState<string | null>(null);
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});

  const { colors } = useTheme();

  const handlePlayerFormSubmit = (data: PlayerFormValues) => {
    if (editPlayerId) {
      setPlayers(players.map(p => p.id === editPlayerId ? { ...p, ...data } : p));
    } else {
      const id = Math.random().toString(36).slice(2, 10);
      setPlayers([...players, { id, ...data }]);
    }
    setModalVisible(false);
    setEditPlayerId(null);
  };

  const handlePlayerFormCancel = () => {
    setModalVisible(false);
    setEditPlayerId(null);
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleEditPlayer = (id: string) => {
    setEditPlayerId(id);
    setModalVisible(true);
  };

  const handleAddPlayer = () => {
    setEditPlayerId(null);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
          <List.Section>
            <List.Subheader>All Players</List.Subheader>
            {players.length === 0 ? (
              <Text>No players saved yet.</Text>
            ) : (
              players.map(player => (
                <Swipeable
                  ref={(ref) => { swipeableRefs.current[player.id] = ref; }}
                  key={player.id}
                  renderRightActions={() => (
                    <View style={styles.swipeActions}>
                      <IconButton icon="pencil" onPress={() => handleEditPlayer(player.id)} />
                      <IconButton icon="delete" iconColor="red" onPress={() => handleDeletePlayer(player.id)} />
                    </View>
                  )}
                >
                  <PlayerListItem
                    player={player}
                    rightIcon="chevron-left"
                    onRightIconPress={() => swipeableRefs.current[player.id]?.openRight()}
                    showSkillLevel={true}
                  />
                </Swipeable>
              ))
            )}
          </List.Section>
        </ScrollView>
        <FAB icon="plus" style={styles.fab} onPress={handleAddPlayer} />
        <Portal>
          <Modal visible={modalVisible} onDismiss={handlePlayerFormCancel} contentContainerStyle={[styles.modal, { backgroundColor: colors.background, borderRadius: 20 }]}> 
            <PlayerForm
              initialValues={editPlayerId ? players.find(p => p.id === editPlayerId) : undefined}
              onSubmit={handlePlayerFormSubmit}
              onCancel={handlePlayerFormCancel}
              title={editPlayerId ? 'Edit Player' : 'Add Player'}
              submitLabel={editPlayerId ? 'Save Changes' : 'Add Player'}
            />
          </Modal>
        </Portal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  modal: { padding: 20, margin: 20 },
  swipeActions: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  input: { marginBottom: 12 },
}); 