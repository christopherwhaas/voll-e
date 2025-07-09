import * as React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { Text, List, FAB, Portal, Modal, IconButton, useTheme, Card } from 'react-native-paper';
import { useAppState } from '../models/AppStateContext';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import PlayerForm, { PlayerFormValues } from '../components/PlayerForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayerListItem from '../components/PlayerListItem';
import styles from '../styles/PlayersScreenStyles';
import { sharedStyles } from '../styles/shared';

export default function PlayersScreen() {
  const { players, setPlayers } = useAppState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editPlayerId, setEditPlayerId] = React.useState<string | null>(null);
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});
  const { height: screenHeight } = Dimensions.get('window');

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
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text variant="headlineMedium" style={[styles.screenTitle, { color: colors.onBackground }]}>
            Players
          </Text>
          <IconButton
            icon="plus"
            size={24}
            onPress={handleAddPlayer}
            style={styles.addButton}
          />
        </View>
        
        {/* Players Card */}
        <Card style={[styles.playersCard, { backgroundColor: colors.background}, sharedStyles.cardBorderRadius]}>
          <Card.Content style={[sharedStyles.cardBorderRadius]}>
            <List.Section>
              <ScrollView showsVerticalScrollIndicator={false}>
                {players.length === 0 ? (
                  <Text>No players saved yet.</Text>
                ) : (
                  players.map(player => {
                    const teammate = player.teammatePreference ? players.find(p => p.id === player.teammatePreference) : undefined;
                    return (
                      <Swipeable
                        ref={(ref) => { swipeableRefs.current[player.id] = ref; }}
                        key={player.id}
                        renderRightActions={() => (
                          <View style={styles.swipeActions}>
                            <IconButton icon="pencil" onPress={() => handleEditPlayer(player.id)} />
                            <IconButton icon="delete" iconColor={colors.error} onPress={() => handleDeletePlayer(player.id)} />
                          </View>
                        )}
                      >
                        <PlayerListItem
                          player={player}
                          rightIcon="chevron-left"
                          onRightIconPress={() => swipeableRefs.current[player.id]?.openRight()}
                          showSkillLevel={true}
                          teammatePreference={teammate}
                        />
                      </Swipeable>
                    );
                  })
                )}
              </ScrollView>
            </List.Section>
          </Card.Content>
        </Card>
        
        <Portal>
          <Modal visible={modalVisible} onDismiss={handlePlayerFormCancel} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}> 
            <View style={sharedStyles.modalHeader}>
              <View style={{ flex: 1 }} />
              <IconButton
                icon="close"
                size={24}
                onPress={handlePlayerFormCancel}
                style={sharedStyles.closeButton}
              />
            </View>
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