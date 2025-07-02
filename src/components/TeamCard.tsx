import * as React from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Card, Text, List, IconButton, useTheme } from 'react-native-paper';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Team, Player, COLOR_MAP } from '../models/types';
import PlayerListItem from './PlayerListItem';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

interface TeamCardProps {
  team: Team;
  onEditTeamName: (teamId: string, newName: string) => void;
  onMovePlayer: (player: Player, fromTeamId: string) => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onDragEnd: (data: Player[]) => void;
  getTeamAvgSkill: (team: Team) => string;
}

export default function TeamCard({
  team,
  onEditTeamName,
  onMovePlayer,
  onRemovePlayer,
  onDragEnd,
  getTeamAvgSkill,
}: TeamCardProps) {
  const { colors } = useTheme();
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});
  return (
    <Card key={team.id} style={[styles.teamCard, { backgroundColor: colors.background }]}>
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
            <Text style={[styles.skillBadge, { backgroundColor: colors.elevation?.level1 || colors.surface, color: colors.onSurface }]}>Avg Skill: {getTeamAvgSkill(team)}</Text>
          </View>
        )}
      />
      <Card.Content style={{ backgroundColor: colors.background }}>
        {team.players.length === 0 ? (
          <Text style={{ color: colors.onSurface, opacity: 0.6 }}>No players assigned.</Text>
        ) : (
          <DraggableFlatList
            data={team.players}
            keyExtractor={item => item.id}
            renderItem={({ item, drag }) => (
              <Swipeable
                ref={ref => { swipeableRefs.current[item.id] = ref; }}
                renderRightActions={() => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                    <IconButton icon="swap-horizontal" iconColor={colors.primary} onPress={() => onMovePlayer(item, team.id)} />
                    <IconButton icon="delete" iconColor={colors.error} onPress={() => onRemovePlayer(team.id, item.id)} />
                  </View>
                )}
              >
                <PlayerListItem
                  player={item}
                  onLongPress={drag}
                  rightIcon="chevron-left"
                  onRightIconPress={() => swipeableRefs.current[item.id]?.openRight()}
                />
              </Swipeable>
            )}
            onDragEnd={({ data }) => onDragEnd(data)}
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
  skillBadge: { backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, marginRight: 8 },
}); 