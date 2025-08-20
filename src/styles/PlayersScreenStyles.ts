import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  screenTitle: {
    fontWeight: 'bold',
  },
  addButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 8,
  },
  modal: {
    padding: 20,
    margin: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 0,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  input: {
    marginBottom: 16,
  },
  playersList: {
    flex: 1
  },
  groupManagementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  groupManagementInfo: {
    flex: 1,
  },
  groupManagementActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 