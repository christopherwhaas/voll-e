import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { Player, SkillLevel } from '../models/types';
import { useAppState } from '../models/AppStateContext';

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
  teammatePreference?: Player;
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
  teammatePreference,
}: PlayerListItemProps) {
  const { colors } = useTheme();
  const { settings } = useAppState();
  const isDark = settings.darkMode;
  // Map skill levels to tag/category color keys (must be after colors is defined)
  const SKILL_LEVEL_COLOR_KEY = {
    New: 'gray',
    Beginner: 'blue',
    Intermediate: 'green',
    Advanced: 'orange',
    Jules: 'purple',
  } as const;
  const skillColorKey = SKILL_LEVEL_COLOR_KEY[player.skillLevel] as keyof typeof colors;
  const badgeTextColor = String(colors[skillColorKey] ?? colors.onSurfaceVariant);

  // Helper for readable text color in light mode
  function getReadableTextColor(bg: string) {
    // Use white for most, dark for gray (from theme)
    const darkTextBgColors = [
      colors['gray' as keyof typeof colors],
    ];
    if (darkTextBgColors.includes(bg)) {
      return colors.onBackground;
    }
    return '#FFF';
  }
  let badgeBgColor = badgeTextColor;
  let badgeText = '#FFF';
  if (isDark) {
    badgeBgColor = String(colors.outlineVariant) + '22';
    badgeText = badgeTextColor;
  } else {
    badgeBgColor = badgeTextColor;
    badgeText = getReadableTextColor(badgeBgColor);
  }

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onLongPress={onLongPress}
      activeOpacity={onLongPress ? 0.7 : 1}
      disabled={!onLongPress}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}> 
        <Text style={[styles.emoji, { color: colors.onSurface }]}>{player.emoji || '👤'}</Text>
      </View>
      {/* Name and skill */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1} ellipsizeMode="tail">
            {player.firstName}{player.lastName ? ` ${player.lastName}` : ''}
          </Text>
          {showSkillLevel && (
            <Text style={[styles.skillBadge, { backgroundColor: badgeBgColor, color: badgeText, borderColor: badgeText }]}> 
              {player.skillLevel}
            </Text>
          )}
        </View>
        {teammatePreference && (
          <View style={styles.teammateBadge}>
            <Text style={[styles.teammateText, { color: colors.onSurfaceVariant }]}>Prefers </Text>
            <Text style={{ fontSize: 14 }}>{teammatePreference.emoji}</Text>
            <Text style={[styles.teammateText, { color: colors.onSurfaceVariant }]}> {teammatePreference.firstName}</Text>
          </View>
        )}
      </View>
      {/* Right icon or actions */}
      {rightIcon && (
        <IconButton icon={rightIcon} iconColor={colors.onSurfaceVariant} onPress={onRightIconPress} style={styles.rightIcon} />
      )}
      {showMove && (
        <IconButton icon="swap-horizontal" iconColor={colors.primary} onPress={onMove} style={styles.rightIcon} />
      )}
      {showDelete && (
        <IconButton icon="delete" iconColor={colors.error} onPress={onDelete} style={styles.rightIcon} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    minHeight: 56,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#EEE',
  },
  emoji: {
    fontSize: 22,
  },
  infoCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 1,
    minWidth: 0,
  },
  skillBadge: {
    fontSize: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  teammateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  teammateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  rightIcon: {
    marginLeft: 2,
    marginRight: -8,
  },
}); 