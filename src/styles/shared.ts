import { StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export const sharedStyles = StyleSheet.create({
  // Card Styles
  cardBorderRadius: {
    borderRadius: 8,
  },
  
  // Modal Styles
  modalStyle: {
    margin: 20,
    padding: 15,
    maxHeight: screenHeight * 0.8, // 80% of screen height
  },
  
  modalContentStyle: {
    flexGrow: 1,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  modalTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'left',
  },
  
  closeButton: {
    padding: 0,
  },
  
  // ScrollView Styles
  modalScrollView: {
    maxHeight: screenHeight * 0.6,
  },
  
  // Settings Styles
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  settingLabel: {
    flex: 1,
  },
});

// Export screenHeight for use in other files
export { screenHeight }; 