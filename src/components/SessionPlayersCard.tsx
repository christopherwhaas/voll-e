import * as React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, FAB, IconButton, useTheme } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import PlayerListItem from './PlayerListItem';
import { Player } from '../models/types';
import { sharedStyles } from '../styles/shared';

interface SessionPlayersCardProps {
  sessionPlayers: Player[];
  numberOfNets: number;
  setNumberOfNets: (nets: number) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  swipeableRefs: React.MutableRefObject<{ [key: string]: any }>;
}

export default function SessionPlayersCard({
  sessionPlayers,
  numberOfNets,
  setNumberOfNets,
  isExpanded,
  setIsExpanded,
  onAddPlayer,
  onRemovePlayer,
  swipeableRefs,
}: SessionPlayersCardProps) {
  const { colors } = useTheme();

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded]);

  return (
    <Card key="session-card" style={[styles.sessionCard, { backgroundColor: colors.primary }, sharedStyles.cardBorderRadius]}>
      <TouchableOpacity onPress={toggleExpanded}>
        <Card.Title
          title={
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>Current Session</Text>
              <Text style={styles.titleSummary}>
                {sessionPlayers.length} player{sessionPlayers.length !== 1 ? 's' : ''} • {numberOfNets} net{numberOfNets !== 1 ? 's' : ''}
              </Text>
            </View>
          }
          right={() => (
            <IconButton
              icon={isExpanded ? "chevron-up" : "chevron-down"}
              onPress={toggleExpanded}
            />
          )}
        />
      </TouchableOpacity>
      {isExpanded && (
        <Card.Content style={{ backgroundColor: colors.surface, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
          <View style={styles.netsRow}>
            <Text style={styles.netsLabel}>Nets for this session:</Text>
            <IconButton icon="minus" size={20} onPress={() => setNumberOfNets(Math.max(1, numberOfNets - 1))} />
            <Text style={styles.netsValue}>{numberOfNets}</Text>
            <IconButton icon="plus" size={20} onPress={() => setNumberOfNets(numberOfNets + 1)} />
          </View>
          <View style={styles.playersSection}>
            <View style={styles.playersHeader}>
              <Text style={styles.playersTitle}>Session Players</Text>
              <FAB
                small
                icon="plus"
                onPress={onAddPlayer}
                style={styles.addButton}
              />
            </View>
            {sessionPlayers.length === 0 ? (
              <Text>No players selected for this session.</Text>
            ) : (
              sessionPlayers.map(player => (
                <Swipeable
                  ref={ref => { swipeableRefs.current[player.id] = ref; }}
                  key={player.id}
                  renderRightActions={() => (
                    <View style={styles.swipeActions}>
                      <IconButton icon="delete" iconColor={colors.error} onPress={() => onRemovePlayer(player.id)} />
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
          </View>
        </Card.Content>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  sessionCard: { marginBottom: 16 },
  addButton: { marginRight: 8 },
  swipeActions: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  netsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'center' },
  netsLabel: { fontWeight: 'bold', marginRight: 8 },
  netsValue: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 8, minWidth: 24, textAlign: 'center' },
  playersSection: { marginTop: 16 },
  playersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  playersTitle: { fontSize: 18, fontWeight: 'bold' },
  titleContainer: {
    flexDirection: 'column',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleSummary: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
}); 