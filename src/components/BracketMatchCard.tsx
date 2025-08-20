// import React from 'react';
// import { View, Text, ViewStyle } from 'react-native';
// import { useTheme } from 'react-native-paper';
// // import { Match, Tournam/ent } from '../models/types';
// import styles from '../styles/TournamentScreenStyles';
// import { CustomThemeColors } from '../styles/Colors';
// import { getTeamById } from '../utils/tournamentUtils';
// import { COLOR_MAP } from '../models/types';

// interface BracketMatchCardProps {
//   match: Match;
//   tournament: Tournament;
//   settings: any;
//   style?: ViewStyle;
// }

// const BracketMatchCard: React.FC<BracketMatchCardProps> = ({ match, tournament, settings, style }) => {
//   const { colors } = useTheme();
  
//   // Get teams with fallback for undefined/null cases
//   const team1 = getTeamById(tournament, match.team1Id) || { id: 'team1_id', name: 'TBD', players: [], losses: 0 };
//   const team2 = getTeamById(tournament, match.team2Id) || { id: 'team2_id', name: 'TBD', players: [], losses: 0 };
  
//   const isComplete = match.isComplete;
//   return (
//     <View style={[styles.bracketMatchCard, style, { backgroundColor: colors.surface, borderColor: colors.outline }]}> 
//       <View style={styles.bracketTeamsVerticalStack}>
//         {/* Team 1 */}
//         <View style={styles.bracketTeamRowOuter}>
//           <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
//             <View style={[
//               styles.bracketTeamInner,
//               { backgroundColor: isComplete && match.winnerId === team1?.id ? colors.secondaryContainer : colors.surfaceVariant }
//             ]}>
//               <View style={[styles.bracketTeamIndicator, { backgroundColor: team1 && team1.name ? COLOR_MAP[team1.name] : colors.outline }]} />
//               <Text style={[styles.bracketTeamName, { color: colors.onSurface }]} numberOfLines={1} ellipsizeMode="tail">{team1 && team1.name ? team1.name : 'TBD'}</Text>
//             </View>
//           </View>
//           <Text style={[styles.bracketTeamScore, { color: colors.onSurface, textAlign: 'right', minWidth: 18, alignSelf: 'flex-end' }]}>{typeof match.team1Wins === 'number' ? match.team1Wins : '-'}</Text>
//         </View>
//         {/* Team 2 */}
//         <View style={styles.bracketTeamRowOuter}>
//           <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
//             <View style={[
//               styles.bracketTeamInner,
//               { backgroundColor: isComplete && match.winnerId === team2?.id ? colors.secondaryContainer : colors.surfaceVariant }
//             ]}>
//               <View style={[styles.bracketTeamIndicator, { backgroundColor: team2 && team2.name ? COLOR_MAP[team2.name] : colors.outline }]} />
//               <Text style={[styles.bracketTeamName, { color: colors.onSurface }]} numberOfLines={1} ellipsizeMode="tail">{team2 && team2.name ? team2.name : 'TBD'}</Text>
//             </View>
//           </View>
//           <Text style={[styles.bracketTeamScore, { color: colors.onSurface, textAlign: 'right', minWidth: 18, alignSelf: 'flex-end' }]}>{typeof match.team2Wins === 'number' ? match.team2Wins : '-'}</Text>
//         </View>
//       </View>
//       {isComplete && match.winnerId && (
//         <View style={styles.bracketWinner}>
//           <Text style={[styles.bracketWinnerText, { color: CustomThemeColors[settings.darkMode ? 'dark' : 'light'].success }]}> Winner: {getTeamById(tournament, match.winnerId!)?.name || 'Unknown'} </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default BracketMatchCard; 