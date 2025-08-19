import * as React from 'react';
import { View, StyleSheet, TextInput as RNTextInput, FlatList } from 'react-native';
import { Card, Text, List, IconButton, useTheme } from 'react-native-paper';
import { Team, Player, COLOR_MAP } from '../models/types';
import PlayerListItem from './PlayerListItem';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { sharedStyles } from '../styles/shared';

interface TeamCardProps {
  team: Team;
  onEditTeamName: (teamId: string, newName: string) => void;
  onMovePlayer: (player: Player, fromTeamId: string) => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  getTeamAvgSkill: (team: Team) => string;
}

export default function TeamCard({
  team,
  onEditTeamName,
  onMovePlayer,
  onRemovePlayer,
  getTeamAvgSkill,
}: TeamCardProps) {
  const { colors } = useTheme();
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});
  return (
    <Card key={team.id} style={[styles.teamCard, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
      <Card.Title
        title={
          <RNTextInput
            value={team.name}
            onChangeText={text => onEditTeamName(team.id, text)}
            style={[styles.teamNameInput, { color: colors.onSurface, backgroundColor: colors.background }]}
            placeholderTextColor={colors.onSurface}
          />
        }
        left={props => <List.Icon {...props} icon="circle" color={COLOR_MAP[team.name] || colors.primary} />}
        right={() => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.skillBadge, { backgroundColor: colors.elevation?.level3 || colors.surface, color: colors.onSurface }]}>Avg Skill: {getTeamAvgSkill(team)}</Text>
          </View>
        )}
      />
      <Card.Content style={[{ backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
        {team.players.length === 0 ? (
          <Text style={{ color: colors.onSurface, opacity: 0.6 }}>No players assigned.</Text>
        ) : (
          <FlatList
            data={team.players}
            keyExtractor={(item: Player) => item.id}
            renderItem={({ item }: { item: Player }) => (
              <Swipeable
                ref={ref => { swipeableRefs.current[item.id] = ref; }}
                renderRightActions={() => (
                  <View style={styles.swipeActions}>
                    <IconButton icon="swap-horizontal" iconColor={colors.primary} onPress={() => onMovePlayer(item, team.id)} />
                    <IconButton icon="delete" iconColor={colors.error} onPress={() => onRemovePlayer(team.id, item.id)} />
                  </View>
                )}
              >
                <PlayerListItem
                  player={item}
                  rightIcon="chevron-left"
                  onRightIconPress={() => swipeableRefs.current[item.id]?.openRight()}
                />
              </Swipeable>
            )}
            scrollEnabled={false}
            style={{ backgroundColor: 'transparent' }}
          />
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  teamCard: { marginVertical: 8 },
  teamNameInput: { fontSize: 18, fontWeight: 'bold', backgroundColor: 'transparent' },
  skillBadge: { ...sharedStyles.cardBorderRadius, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, marginRight: 8 },
  swipeActions: { flexDirection: 'row', alignItems: 'center', height: '100%' },
}); 