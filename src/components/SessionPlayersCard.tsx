import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, FAB, IconButton, useTheme } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import PlayerListItem from './PlayerListItem';
import { Player } from '../models/types';

interface SessionPlayersCardProps {
  sessionPlayers: Player[];
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  swipeableRefs: React.MutableRefObject<{ [key: string]: any }>;
}

export default function SessionPlayersCard({
  sessionPlayers,
  onAddPlayer,
  onRemovePlayer,
  swipeableRefs,
}: SessionPlayersCardProps) {
  const { colors } = useTheme();

  return (
    <Card style={[styles.sessionCard, { backgroundColor: colors.background }]}>
      <Card.Title
        title="Session Players"
        right={() => (
          <FAB
            small
            icon="plus"
            onPress={onAddPlayer}
            style={styles.addButton}
          />
        )}
      />
      <Card.Content style={{ backgroundColor: colors.surface }}>
        {sessionPlayers.length === 0 ? (
          <Text>No players selected for this session.</Text>
        ) : (
          sessionPlayers.map(player => (
            <Swipeable
              ref={ref => { swipeableRefs.current[player.id] = ref; }}
              key={player.id}
              renderRightActions={() => (
                <View style={[styles.swipeAction, { backgroundColor: colors.error }]}>
                  <IconButton icon="delete" iconColor={colors.onError} onPress={() => onRemovePlayer(player.id)} />
                </View>
              )}
            >
              <PlayerListItem
                player={player}
                rightIcon="chevron-left"
                onRightIconPress={() => swipeableRefs.current[player.id]?.openRight()}
              />
            </Swipeable>
          ))
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  sessionCard: { marginBottom: 16 },
  addButton: { marginRight: 8 },
  swipeAction: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'red', width: 64 },
}); 