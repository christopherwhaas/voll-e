// // TEMPORARILY DISABLED - Tournament functionality
// // This file has been commented out to remove tournament logic from the app

// /*
// import * as React from 'react';
// import { View, ScrollView, FlatList, KeyboardAvoidingView, Platform, Pressable, TouchableOpacity, Animated } from 'react-native';
// import { Text, Button, Portal, Modal, List, IconButton, Checkbox, Dialog, RadioButton, useTheme, Switch, TextInput } from 'react-native-paper';
// import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
// import { useAppState } from '../models/AppStateContext';
// import { Player, COLOR_NAMES, SKILL_VALUES, Team, Tournament, TournamentSettings, Match, TournamentRound } from '../models/types';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { SCREEN_MARGIN, SORT_OPTIONS } from '../utils/constants';
// import { sharedStyles, screenHeight } from '../styles/shared';
// import PlayerForm, { PlayerFormValues } from '../components/PlayerForm';
// import TeamCard from '../components/TeamCard';
// import SettingsModal from '../components/SettingsModal';
// import TabSelector from '../components/TabSelector';
// import { generateRandomTeams, generateSnakeDraftTeams } from '../utils/teamGeneration';
// import styles from '../styles/TournamentScreenStyles';

// // Helper to get random color names for teams
// function getRandomColorNames(numTeams: number): string[] {
//   const shuffled = [...COLOR_NAMES].sort(() => Math.random() - 0.5);
//   if (numTeams <= COLOR_NAMES.length) {
//     return shuffled.slice(0, numTeams);
//   } else {
//     // If more teams than colors, repeat colors as needed
//     const result = [];
//     for (let i = 0; i < numTeams; i++) {
//       result.push(shuffled[i % COLOR_NAMES.length]);
//     }
//     return result;
//   }
// }

// // Tournament generation functions
// const generateTournamentBracket = (teams: Team[], settings: TournamentSettings) => {
//   // Implementation would go here
//   return [];
// };

// const generateMatches = (teams: Team[], round: number, bracket: 'winner' | 'loser' | 'final') => {
//   // Implementation would go here
//   return [];
// };

// export default function TournamentScreen() {
//   const { teams, tournaments, setTournaments, settings } = useAppState();
//   const [modalVisible, setModalVisible] = React.useState(false);
//   const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
//   const [sessionDrawerVisible, setSessionDrawerVisible] = React.useState(false);
//   const [sessionDrawerExpanded, setSessionDrawerExpanded] = React.useState(false);
//   const [drawerTranslateY, setDrawerTranslateY] = React.useState(0);
//   const [drawerHeight, setDrawerHeight] = React.useState(0);
//   const [minDrawerHeight, setMinDrawerHeight] = React.useState(0);
//   const [tournamentModalVisible, setTournamentModalVisible] = React.useState(false);
//   const [tournamentSettings, setTournamentSettings] = React.useState<TournamentSettings>({
//     doubleElimination: true,
//     preliminaryMatchesPerRound: 1,
//     championshipMatchesPerRound: 1,
//   });
//   const [tournamentName, setTournamentName] = React.useState('');
//   const [selectedTeams, setSelectedTeams] = React.useState<string[]>([]);
//   const [teamMode, setTeamMode] = React.useState<'existing' | 'byot'>('existing');
//   const [byotTeamNames, setByotTeamNames] = React.useState<string[]>(['', '']);

//   const { colors } = useTheme();
//   const swipeableRefs = React.useRef<{ [key: string]: any }>({});

//   // Get session players
//   const sessionPlayers = teams.flatMap(team => team.players);
//   const availableTeams = teams.filter(team => !selectedTeams.includes(team.id));

//   // Auto-show session drawer when no teams are selected
//   React.useEffect(() => {
//     if (teams.length === 0) {
//       setSessionDrawerVisible(true);
//       setSessionDrawerExpanded(true);
//     }
//   }, [teams.length]);

//   // Gesture handling for session drawer
//   const onGestureEvent = Animated.event(
//     [{ nativeEvent: { translationY: drawerTranslateY } }],
//     { useNativeDriver: true }
//   );

//   const onGestureEventUp = Animated.event(
//     [{ nativeEvent: { translationY: drawerTranslateY } }],
//     { useNativeDriver: true }
//   );

//   const onHandlerStateChange = (event: any) => {
//     if (event.nativeEvent.state === State.END) {
//       const { translationY } = event.nativeEvent;
//       const shouldExpand = translationY < -50 || (drawerHeight > minDrawerHeight + 100 && translationY > -50);
//       setSessionDrawerExpanded(shouldExpand);
//     }
//   };

//   // Team selection handlers
//   const handleToggleSelect = (id: string) => {
//     setSelectedIds(prev => 
//       prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
//     );
//   };

//   const handleSelectAll = () => {
//     setSelectedIds(teams.map(team => team.id));
//   };

//   const handleUnselectAll = () => {
//     setSelectedIds([]);
//   };

//   const handleAddSelected = () => {
//     setSelectedTeams(prev => [...prev, ...selectedIds]);
//     setSelectedIds([]);
//     setModalVisible(false);
//   };

//   const handleRemoveFromSession = (id: string) => {
//     setSelectedTeams(prev => prev.filter(teamId => teamId !== id));
//   };

//   // Tournament creation handlers
//   const handleCreateTournament = () => {
//     if (selectedTeams.length < 2) {
//       alert('Please select at least 2 teams for the tournament');
//       return;
//     }
//     setTournamentModalVisible(true);
//   };

//   const handleConfirmTournament = () => {
//     if (!tournamentName.trim()) {
//       alert('Please enter a tournament name');
//       return;
//     }

//     const tournamentTeams = selectedTeams.map(teamId => {
//       const team = teams.find(t => t.id === teamId);
//       return {
//         id: team!.id,
//         name: team!.name,
//         players: team!.players,
//         losses: 0,
//       };
//     });

//     const newTournament: Tournament = {
//       id: Math.random().toString(36).slice(2, 10),
//       name: tournamentName,
//       teams: tournamentTeams,
//       settings: tournamentSettings,
//       rounds: [],
//       isComplete: false,
//     };

//     const updatedTournaments = [...tournaments, newTournament];
//     setTournaments(updatedTournaments);
//     setTournamentModalVisible(false);
//     setTournamentName('');
//     setSelectedTeams([]);
//   };

//   const handleCancelTournament = () => {
//     setTournamentModalVisible(false);
//     setTournamentName('');
//     setSelectedTeams([]);
//   };

//   // BYOT (Bring Your Own Team) handlers
//   const handleCreateBYOTTournament = () => {
//     const validTeamNames = byotTeamNames.filter(name => name.trim() !== '');
//     if (validTeamNames.length < 2) {
//       alert('Please enter at least 2 team names');
//       return;
//     }

//     const tournamentTeams = validTeamNames.map((name, index) => ({
//       id: `byot-${index}`,
//       name: name.trim(),
//       players: [],
//       losses: 0,
//     }));

//     const newTournament: Tournament = {
//       id: Math.random().toString(36).slice(2, 10),
//       name: tournamentName || 'BYOT Tournament',
//       teams: tournamentTeams,
//       settings: tournamentSettings,
//       rounds: [],
//       isComplete: false,
//     };

//     const updatedTournaments = [...tournaments, newTournament];
//     setTournaments(updatedTournaments);
//     setTournamentModalVisible(false);
//     setTournamentName('');
//     setByotTeamNames(['', '']);
//   };

//   const byotCanAddTeam = byotTeamNames.length % 2 === 0;
//   const byotCanRemoveTeam = byotTeamNames.length > 2;

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         {/* Title */}
//         <View style={styles.titleContainer}>
//           <Text variant="headlineMedium" style={[styles.screenTitle, { color: colors.onBackground }]}>
//           Tournaments
//         </Text>
//           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//             <IconButton
//               icon="plus"
//               size={24}
//               onPress={() => setModalVisible(true)}
//               style={styles.addButton}
//             />
//         </View>
//       </View>

//         {/* Tournament List */}
//         <View style={styles.tournamentsContainer}>
//           {tournaments.length === 0 ? (
//             <View style={styles.emptyState}>
//               <Text variant="titleMedium" style={{ marginBottom: 8, textAlign: 'center' }}>
//                 No tournaments yet
//               </Text>
//               <Text style={{ textAlign: 'center', opacity: 0.7 }}>
//                 Create your first tournament to get started
//               </Text>
//             </View>
//           ) : (
//             <ScrollView showsVerticalScrollIndicator={false}>
//               {tournaments.map(tournament => (
//                 <View key={tournament.id} style={[styles.tournamentCard, { backgroundColor: colors.surface }]}>
//                   <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
//                     {tournament.name}
//                   </Text>
//                   <Text style={{ opacity: 0.7, marginBottom: 8 }}>
//                     {tournament.teams.length} teams • {tournament.isComplete ? 'Completed' : 'In Progress'}
//                   </Text>
//                   <Button 
//                     mode="outlined" 
//                     onPress={() => {/* Navigate to tournament details */}}
//                     style={{ alignSelf: 'flex-start' }}
//                   >
//                     View Tournament
//                   </Button>
//                 </View>
//               ))}
//             </ScrollView>
//             )}
//           </View>

//         {/* Create Tournament Button */}
//         {selectedTeams.length >= 2 && (
//           <View style={styles.createButtonContainer}>
//             <Button 
//               mode="contained" 
//               onPress={handleCreateTournament}
//               style={styles.createButton}
//               buttonColor={colors.primary}
//               textColor={colors.onPrimary}
//             >
//               Create Tournament ({selectedTeams.length} teams)
//             </Button>
//         </View>
//       )}

//         {/* Team Selection Modal */}
//       <Portal>
//           <Modal visible={modalVisible} onDismiss={() => { setModalVisible(false); setSelectedIds([]); }} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}> 
//             <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//           <View style={sharedStyles.modalHeader}>
//                 <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Select Teams for Tournament</Text>
//             <IconButton
//               icon="close"
//               size={24}
//                   onPress={() => { setModalVisible(false); setSelectedIds([]); }}
//                   style={sharedStyles.closeButton}
//             />
//           </View>
//               <ScrollView 
//                 keyboardShouldPersistTaps="never" 
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={sharedStyles.modalContentStyle}
//                 style={sharedStyles.modalScrollView}
//               >
//                 <Button 
//               mode="outlined"
//                   style={[{ marginBottom: 16 }, sharedStyles.cardBorderRadius]} 
//                   onPress={handleAddSelected} 
//                   disabled={selectedIds.length === 0} 
//                   textColor={colors.primary}
//                 >
//                   Add to Tournament ({selectedIds.length})
//                 </Button>
//                 <View style={styles.selectHeader}>
//                   <Text variant="titleMedium" style={{ color: colors.onBackground }}>Select Teams</Text>
//                   <TouchableOpacity
//                     style={styles.selectAllContainer}
//                     onPress={() => {
//                       if (selectedIds.length === availableTeams.length) {
//                         handleUnselectAll();
//                       } else {
//                         handleSelectAll();
//                       }
//                     }}
//                   >
//                     <Checkbox
//                       status={selectedIds.length === availableTeams.length && availableTeams.length > 0 ? 'checked' : 'unchecked'}
//                       disabled={true}
//                       color={colors.primary}
//                     />
//                     <Text style={[styles.selectAllText, { color: colors.onSurfaceVariant }]}>
//                       {selectedIds.length === availableTeams.length && availableTeams.length > 0 ? 'Unselect All' : 'Select All'}
//                     </Text>
//                   </TouchableOpacity>
//               </View>
//                 {availableTeams.length === 0 ? (
//                   <Text>No available teams. Create teams first.</Text>
//                 ) : (
//                   availableTeams.map(team => (
//                     <List.Item
//                       key={team.id}
//                       title={team.name}
//                       description={`${team.players.length} players`}
//                       left={props => (
//                         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                           <Checkbox
//                             status={selectedIds.includes(team.id) ? 'checked' : 'unchecked'}
//                             onPress={() => handleToggleSelect(team.id)}
//                           />
//             </View>
//                       )}
//                       onPress={() => handleToggleSelect(team.id)}
//                     />
//                   ))
//                 )}
//               </ScrollView>
//             </KeyboardAvoidingView>
//           </Modal>

//           {/* Tournament Creation Modal */}
//           <Modal visible={tournamentModalVisible} onDismiss={handleCancelTournament} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
//             <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//               <View style={sharedStyles.modalHeader}>
//                 <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Create Tournament</Text>
//                 <IconButton
//                   icon="close"
//                   size={24}
//                   onPress={handleCancelTournament}
//                   style={sharedStyles.closeButton}
//                 />
//               </View>
//               <ScrollView 
//                 keyboardShouldPersistTaps="never" 
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={sharedStyles.modalContentStyle}
//                 style={sharedStyles.modalScrollView}
//               >
//                 <TextInput
//                   mode="outlined"
//                   label="Tournament Name"
//                   value={tournamentName}
//                   onChangeText={setTournamentName}
//                   style={{ marginBottom: 16 }}
//                   textColor={colors.onSurface}
//                   outlineColor={colors.outline}
//                   activeOutlineColor={colors.primary}
//                 />

//                 <View style={styles.settingsSection}>
//                   <Text variant="titleMedium" style={{ marginBottom: 12, color: colors.onBackground }}>Tournament Settings</Text>
                  
//                   <View style={styles.settingRow}>
//                     <Text style={{ flex: 1, color: colors.onSurface }}>Double Elimination</Text>
//                     <Switch
//                       value={tournamentSettings.doubleElimination}
//                       onValueChange={(value) => setTournamentSettings(prev => ({ ...prev, doubleElimination: value }))}
//                       color={colors.primary}
//                     />
//             </View>

//             <View style={styles.settingRow}>
//                     <Text style={{ flex: 1, color: colors.onSurface }}>Preliminary Matches per Round</Text>
//                     <TextInput
//                       mode="outlined"
//                       value={tournamentSettings.preliminaryMatchesPerRound.toString()}
//                       onChangeText={(text) => {
//                         const value = parseInt(text) || 1;
//                         setTournamentSettings(prev => ({ ...prev, preliminaryMatchesPerRound: Math.max(1, value) }));
//                       }}
//                       keyboardType="numeric"
//                       style={{ width: 80 }}
//                       textColor={colors.onSurface}
//                       outlineColor={colors.outline}
//                       activeOutlineColor={colors.primary}
//                     />
//             </View>

//                   <View style={styles.settingRow}>
//                     <Text style={{ flex: 1, color: colors.onSurface }}>Championship Matches per Round</Text>
//                     <TextInput
//                       mode="outlined"
//                       value={tournamentSettings.championshipMatchesPerRound.toString()}
//                       onChangeText={(text) => {
//                         const value = parseInt(text) || 1;
//                         setTournamentSettings(prev => ({ ...prev, championshipMatchesPerRound: Math.max(1, value) }));
//                       }}
//                       keyboardType="numeric"
//                       style={{ width: 80 }}
//                       textColor={colors.onSurface}
//                       outlineColor={colors.outline}
//                       activeOutlineColor={colors.primary}
//                     />
//                   </View>
//                 </View>

//                 <View style={{ marginTop: 16 }}>
//                   <Button mode="contained" onPress={handleConfirmTournament} style={[{ marginBottom: 12 }, sharedStyles.cardBorderRadius]} buttonColor={colors.primary} textColor={colors.onPrimary}>
//                     Create Tournament
//                   </Button>
//                   <Button mode="outlined" onPress={handleCancelTournament} style={[{ borderColor: colors.error }, sharedStyles.cardBorderRadius]} textColor={colors.error}>
//                     Cancel
//                   </Button>
//                 </View>
//               </ScrollView>
//             </KeyboardAvoidingView>
//           </Modal>
//         </Portal>
        
//         {/* Session Drawer */}
//         {sessionDrawerVisible && (
//           <PanGestureHandler
//             onGestureEvent={(event) => {
//               onGestureEvent(event);
//               onGestureEventUp(event);
//             }}
//             onHandlerStateChange={onHandlerStateChange}
//           >
//             <Surface 
//               style={[
//                 styles.sessionDrawer, 
//                 { 
//                   backgroundColor: colors.surface,
//                   transform: [{ translateY: drawerTranslateY }]
//                 }
//               ]}
//               onLayout={(event) => {
//                 const { height } = event.nativeEvent.layout;
//                 setDrawerHeight(height);
//               }}
//             >
//               {/* Drawer Tab Indicator */}
//               <View style={styles.drawerTab}>
//                 <View style={[styles.drawerTabHandle, { backgroundColor: colors.onSurfaceVariant }]} />
//               </View>
              
//               <View 
//                 style={styles.drawerHeader}
//                 onLayout={(event: any) => {
//                   const { height } = event.nativeEvent.layout;
//                   setMinDrawerHeight(height);
//                 }}
//               >
//                 <View style={styles.drawerTitleContainer}>
//                   <Text variant="titleMedium" style={[styles.drawerTitle, { color: colors.onSurface }]}>
//                     Tournament Teams
//                   </Text>
//                   <Text style={[styles.drawerSubtitle, { color: colors.onSurfaceVariant }]}>
//                     {selectedTeams.length} team{selectedTeams.length !== 1 ? 's' : ''} selected
//                   </Text>
//                     </View>
//               </View>
              
//               {sessionDrawerExpanded && (
//                 <ScrollView 
//                   style={styles.drawerContent}
//                   showsVerticalScrollIndicator={false}
//                   nestedScrollEnabled={true}
//                 >
//                   <View style={styles.teamsSection}>
//                     <View style={styles.teamsHeader}>
//                       <Text style={[styles.teamsTitle, { color: colors.onSurface }]}>Selected Teams</Text>
//           <IconButton
//             icon="plus"
//             size={24}
//                         onPress={() => setModalVisible(true)}
//                         style={styles.addButton}
//                       />
//                     </View>
                    
//                     {selectedTeams.length === 0 ? (
//                       <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
//                         No teams selected for tournament.
//                       </Text>
//                     ) : (
//                       selectedTeams.map(teamId => {
//                         const team = teams.find(t => t.id === teamId);
//                         if (!team) return null;
//                         return (
//                           <View key={team.id} style={[styles.teamItem, { backgroundColor: colors.surfaceVariant }]}>
//                             <Text style={[styles.teamName, { color: colors.onSurface }]}>
//                               {team.name}
//                             </Text>
//                             <Text style={[styles.teamPlayers, { color: colors.onSurfaceVariant }]}>
//                               {team.players.length} players
//                             </Text>
//                             <IconButton
//                               icon="close"
//                               size={20}
//                               onPress={() => handleRemoveFromSession(team.id)}
//                               iconColor={colors.error}
//           />
//         </View>
//                         );
//                       })
//                     )}
//                   </View>
//                 </ScrollView>
//               )}
//             </Surface>
//           </PanGestureHandler>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// } 
// */ 