import { StyleSheet, Dimensions } from 'react-native';
import { SCREEN_MARGIN } from '../utils/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_MARGIN,
    paddingVertical: 16,
  },
  
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_MARGIN,
  },
  
  // Status Card
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  statusText: {
    fontSize: 14,
    marginBottom: 8,
  },
  
  winnerSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  
  winnerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  runnerUpText: {
    fontSize: 14,
  },
  
  tournamentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  
  // Bracket Visualization
  bracketVisualization: {
    marginBottom: 16,
  },
  
  bracketLevel: {
    marginBottom: 16,
  },
  
  bracketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  bracketContainer: {
    flexDirection: 'row',
  },
  
  roundColumn: {
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  finalRoundColumn: {
    minWidth: 140,
    // backgroundColor set dynamically for finals if needed
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  bracketMatchCard: {
    // backgroundColor set via theme in component
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 10,
    minWidth: 100,
    maxWidth: 140,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    // borderColor set via theme in component
  },
  finalMatchCard: {
    // borderColor and backgroundColor set dynamically for finals
    borderWidth: 2,
  },
  matchTeamsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 4,
  },
  matchTeamBox: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor set via theme in component if needed
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 44,
    maxWidth: 90,
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  vsText: {
    marginHorizontal: 4,
    fontWeight: 'bold',
    fontSize: 13,
  },
  matchScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 1,
    minWidth: 14,
    textAlign: 'center',
  },
  
  bracketMatch: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    minHeight: 80,
    elevation: 1,
  },
  
  bracketTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  bracketTeamIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  
  bracketTeamName: {
    fontSize: 12,
    flexShrink: 1,
    minWidth: 0,
    fontWeight: '600',
    textAlign: 'center',
  },
  bracketTeamRowOuter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bracketTeamInner: {
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 0,
    flexShrink: 1,
    maxWidth: 90,
    // backgroundColor set dynamically in component
  },
  bracketTeamNameScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    flex: 1,
  },
  
  bracketWinner: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  
  bracketWinnerText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Matches Section
  matchesSection: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  // Match Card
  matchCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  matchNumber: {
    fontSize: 12,
  },
  
  matchContent: {
    gap: 8,
  },
  
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  teamIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  
  winButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  
  winnerIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  
  winnerText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  matchesToWin: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_MARGIN,
  },
  
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  createButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  
  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  
  // Teams Preview
  teamsPreview: {
    marginTop: 16,
    marginBottom: 24,
  },
  
  teamsPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  teamPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  teamPreviewIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  
  teamPreviewName: {
    fontSize: 14,
  },
  
  createTournamentButton: {
    borderRadius: 8,
    paddingVertical: 8,
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  
  fabButton: {
    borderRadius: 28,
    elevation: 4,
  },
  // Compact Match Card Styles
  compactMatchCard: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'column',
    elevation: 1,
    minHeight: 44,
    alignItems: 'stretch',
  },
  compactMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  compactTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 48,
    maxWidth: 90,
    flexShrink: 1,
  },
  compactTeamIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  compactTeamName: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  compactScore: {
    fontSize: 15,
    fontWeight: 'bold',
    minWidth: 18,
    textAlign: 'center',
  },
  compactVs: {
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  compactWinButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 2,
  },
  compactWinButton: {
    borderRadius: 16,
    padding: 0,
    marginHorizontal: 0,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
    alignSelf: 'center',
  },
  compactBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  compactWinnerText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  compactMatchesToWin: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    color: '#888',
  },
  compactTeamVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    maxWidth: 100,
    flexShrink: 1,
    gap: 2,
  },
  compactTeamNameButton: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    elevation: 2,
    overflow: 'hidden',
  },
  activeMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 2,
  },
  activeTeamPill: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 90,
    marginHorizontal: 2,
    backgroundColor: '#f7fafc',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  activeTeamName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  activeTeamScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  verticalTeamStack: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 2,
  },
  verticalTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginBottom: 2,
    backgroundColor: 'transparent',
    gap: 8,
  },
  verticalTeamWinner: {
    // backgroundColor set dynamically for winner highlight
  },
  verticalTeamName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  verticalTeamScore: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
    marginRight: 8,
  },
  verticalWinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 4,
    elevation: 2,
  },
  verticalWinButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  bracketTeamTextCol: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    gap: 2,
  },
  bracketTeamScore: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: -2,
    lineHeight: 15,
    textAlign: 'right',
    minWidth: 18,
    marginLeft: 0,
  },
  bracketTeamsVerticalStack: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bracketTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  bracketVsText: {
    fontSize: 13,
    fontWeight: 'bold',
    // color: '#888', // use theme in component
    textAlign: 'center',
    marginVertical: 0,
    marginBottom: 2,
  },
  // --- Tournament Summary Card Refactor ---
  summaryCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  summaryStat: {
    fontSize: 13,
    // color: '#888', // use theme in component
    marginRight: 10,
  },
  summarySectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    // color: '#888', // use theme in component
  },
  standingsTable: {
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginTop: 4,
    marginBottom: 8,
    padding: 0,
  },
  standingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    // borderBottomColor: '#eee', // use theme in component
  },
  standingsTeamBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
  },
  standingsTeamName: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
    minWidth: 0,
  },
  standingsStat: {
    fontSize: 14,
    minWidth: 28,
    textAlign: 'center',
    // color: '#444', // use theme in component
    fontWeight: '500',
  },
  standingsEliminated: {
    opacity: 0.45,
  },
  standingsWinner: {
    fontWeight: 'bold',
    // color: '#FFD700', // use theme in component
  },
  standingsRunnerUp: {
    fontWeight: 'bold',
    // color: '#C0C0C0', // use theme in component
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  matchActiveBadge: {
    // backgroundColor: '#E2E8F0', // use theme in component
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  matchActiveBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    // color: '#2B6CB0', // use theme in component
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'center',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeCompleted: {
    // backgroundColor: '#38A169', // use theme in component
  },
  statusBadgeInProgress: {
    // backgroundColor: '#3182CE', // use theme in component
  },
  statusBadgeText: {
    fontWeight: 'bold',
    fontSize: 13,
    // color: '#fff', // use theme in component
    textAlign: 'center',
  },
}); 