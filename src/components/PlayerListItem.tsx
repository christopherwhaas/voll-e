import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { Player } from '../models/types';

interface PlayerListItemProps {
  player: Player;
  onMove?: () => void;
  onDelete?: () => void;
  onLongPress?: () => void;
  showMove?: boolean;
  showDelete?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
  showSkillLevel?: boolean;
}

export default function PlayerListItem({
  player,
  onMove,
  onDelete,
  onLongPress,
  showMove = false,
  showDelete = false,
  rightIcon,
  onRightIconPress,
  showSkillLevel = false,
}: PlayerListItemProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.background }]}
      onLongPress={onLongPress}
      activeOpacity={onLongPress ? 0.7 : 1}
      disabled={!onLongPress}
    >
      <View style={styles.leftContainer}>
        <Text style={[styles.emoji, { color: colors.onSurface }]}>{player.emoji || '👤'}</Text>
        <View style={styles.nameSkillCol}>
          <Text style={[styles.name, { color: colors.onSurface }]}>{player.firstName} {player.lastName}</Text>
          {showSkillLevel && (
            <Text style={[styles.skillLevel, { color: colors.onSurface, opacity: 0.7 }]}>{player.skillLevel}</Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        {showMove && (
          <IconButton icon="swap-horizontal" iconColor={colors.primary} onPress={onMove} />
        )}
        {showDelete && (
          <IconButton icon="delete" iconColor={colors.error} onPress={onDelete} />
        )}
        {rightIcon && (
          <IconButton icon={rightIcon} iconColor={colors.onSurface} onPress={onRightIconPress} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
    alignSelf: 'center',
  },
  name: {
    fontSize: 16,
    alignSelf: 'center',
  },
  nameSkillCol: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  skillLevel: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 