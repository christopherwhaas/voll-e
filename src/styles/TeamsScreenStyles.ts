import { StyleSheet } from 'react-native';
import { SCREEN_MARGIN } from '../utils/constants';

const styles = StyleSheet.create({
  container: { flex: 1 },
  sessionCard: { marginBottom: 16 },
  addButton: { marginRight: 8, borderRadius: 8 },
  modal: { padding: 20, margin: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  },
  closeButton: {
    padding: 0,
  },
  teamsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  controlsContainer: { flexDirection: 'column', alignItems: 'stretch', marginVertical: 0 },
  controlButton: { marginVertical: 4, marginBottom: 8, borderRadius: 8 },
  swipeAction: { justifyContent: 'center', alignItems: 'center', width: 64 },
  input: { marginBottom: 12 },
  teamCard: { marginVertical: 8 },
  teamNameInput: { fontSize: 18, fontWeight: 'bold', backgroundColor: 'transparent' },
  skillBadge: { backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, marginRight: 8 },
  swipeActionRow: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  formContainer: { marginBottom: 16 },
  buttonContainer: { marginBottom: 12 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  manualTeamCard: { marginBottom: 12 },
  manualPlayerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, minHeight: 40 },
  unassignedContainer: { marginBottom: 16 },
  tableContainer: { flexDirection: 'row' },
  fixedColumn: { width: 120, backgroundColor: 'transparent' },
  scrollableColumns: { flex: 1 },
  tableRow: { height: 48, flexDirection: 'row', alignItems: 'center' },
  teamHeaders: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  teamHeaderText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  generationContainer: { marginBottom: 16 },
  generationRow: { flexDirection: 'row', alignItems: 'center' },
  dropdownButton: { marginLeft: 0, borderRadius: 8 },
  dropdownMenu: { marginTop: 8, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  screenTitle: { fontWeight: 'bold' },
  actionButtonsContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quickActionsContainer: { flexDirection: 'row', alignItems: 'center' },
  settingsContainer: { flexDirection: 'row', alignItems: 'center' },
  modernIconButton: { 
    margin: 0, 
    padding: 8,
    borderRadius: 8,
  },
  settingsButton: { marginLeft: 8 },
  tabSelector: { marginBottom: 12 },
  
  // Session Drawer Styles
  sessionDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  drawerTab: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 2,
  },
  drawerTabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 0,
  },
  drawerTitleContainer: {
    flex: 1,
  },
  drawerTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    
  },
  drawerSubtitle: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  drawerContent: {
    padding: 16,
    maxHeight: 400, // Maximum height to prevent going off screen
  },
  netsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  netsLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  netsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  playersSection: {
    marginTop: 8,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  playerName: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.6,
    padding: 20,
  },
  
  // Select Players Modal Styles
  selectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    marginLeft: 8,
  },
  
  // Fixed Header Style
  fixedHeader: {
    paddingHorizontal: SCREEN_MARGIN,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  
  // Title Button Styles
  titleButton: {
    marginRight: 4,
  },
  
  // Generate Button Styles
  generateContainer: {
    marginTop: 0,
    marginBottom: 5,
    paddingHorizontal: 0,
  },
  generateButton: {
    borderRadius: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  
  // Modern Swap Dialog Styles
  modernSwapItem: {
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  swapItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swapItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  swapItemInfo: {
    flex: 1,
  },
  swapItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  swapItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  teamBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  skillText: {
    fontSize: 12,
  },
  swapItemRight: {
    alignItems: 'flex-end',
  },
  avgSkillText: {
    fontSize: 12,
    marginBottom: 4,
  },

});

export default styles; 