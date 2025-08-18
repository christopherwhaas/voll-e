import * as React from 'react';
import { View, ScrollView, Dimensions, Alert, Clipboard, Share } from 'react-native';
import { Text, List, FAB, Portal, Modal, IconButton, useTheme, Card, Button, TextInput } from 'react-native-paper';
import { useAppState } from '../models/AppStateContext';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import PlayerForm, { PlayerFormValues } from '../components/PlayerForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayerListItem from '../components/PlayerListItem';
import styles from '../styles/PlayersScreenStyles';
import { sharedStyles } from '../styles/shared';
import { Player } from '../models/types';

export default function PlayersScreen() {
  const { players, setPlayers } = useAppState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editPlayerId, setEditPlayerId] = React.useState<string | null>(null);
  const [importModalVisible, setImportModalVisible] = React.useState(false);
  const [exportModalVisible, setExportModalVisible] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [importError, setImportError] = React.useState('');
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});
  const { height: screenHeight } = Dimensions.get('window');

  const { colors } = useTheme();

  const handlePlayerFormSubmit = (data: PlayerFormValues) => {
    if (editPlayerId) {
      setPlayers(players.map(p => p.id === editPlayerId ? { ...p, ...data } : p));
    } else {
      const id = Math.random().toString(36).slice(2, 10);
      setPlayers([...players, { id, ...data }]);
    }
    setModalVisible(false);
    setEditPlayerId(null);
  };

  const handlePlayerFormCancel = () => {
    setModalVisible(false);
    setEditPlayerId(null);
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleEditPlayer = (id: string) => {
    setEditPlayerId(id);
    setModalVisible(true);
  };

  const handleAddPlayer = () => {
    setEditPlayerId(null);
    setModalVisible(true);
  };

  // Import/Export functions
  const handleExportPlayers = () => {
    // Export players with IDs for complete data preservation
    const exportData = JSON.stringify(players, null, 2);
    setImportText(exportData);
    setExportModalVisible(true);
  };

  const handleImportPlayers = () => {
    setImportText('');
    setImportError('');
    setImportModalVisible(true);
  };

  const validatePlayerData = (data: any): data is Player[] => {
    if (!Array.isArray(data)) {
      return false;
    }
    
    for (const player of data) {
      if (!player.firstName || typeof player.firstName !== 'string') return false;
      if (player.lastName !== undefined && typeof player.lastName !== 'string') return false;
      if (!player.skillLevel || typeof player.skillLevel !== 'string') return false;
      
      // Optional fields
      if (player.teamSizePreference && typeof player.teamSizePreference !== 'string') return false;
      if (player.teammatePreference && typeof player.teammatePreference !== 'string') return false;
      if (player.emoji && typeof player.emoji !== 'string') return false;
    }
    
    return true;
  };

  const handleImportSubmit = () => {
    try {
      const parsedData = JSON.parse(importText);
      
      if (!validatePlayerData(parsedData)) {
        setImportError('Invalid player data structure. Please check the format.');
        return;
      }

      // Create a mapping of old IDs to new IDs
      const idMapping: { [oldId: string]: string } = {};
      const importedPlayers = parsedData.map((player: any) => {
        const newId = Math.random().toString(36).slice(2, 10);
        idMapping[player.id] = newId;
        return {
          ...player,
          id: newId
        };
      });

      // Update teammate preferences to use new IDs
      const updatedPlayers = importedPlayers.map((player: any) => {
        if (player.teammatePreference && idMapping[player.teammatePreference]) {
          return {
            ...player,
            teammatePreference: idMapping[player.teammatePreference]
          };
        } else {
          return {
            ...player,
            teammatePreference: ''
          };
        }
      });

      setPlayers([...players, ...updatedPlayers]);
      setImportModalVisible(false);
      setImportText('');
      setImportError('');
      
      Alert.alert('Success', `Successfully imported ${updatedPlayers.length} players!`);
    } catch (error) {
      setImportError('Invalid JSON format. Please check your import data.');
    }
  };

  const handleImportCancel = () => {
    setImportModalVisible(false);
    setImportText('');
    setImportError('');
  };

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setString(importText);
      Alert.alert('Copied!', 'Player data has been copied to clipboard.');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard.');
    }
  };

  const handleSharePlayers = async () => {
    try {
      await Share.share({
        message: importText,
        title: 'Player Data Export'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share player data.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text variant="headlineMedium" style={[styles.screenTitle, { color: colors.onBackground }]}>
            Players
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="download"
              size={24}
              onPress={handleExportPlayers}
              style={styles.addButton}
            />
            <IconButton
              icon="plus"
              size={24}
              onPress={handleAddPlayer}
              style={styles.addButton}
            />
          </View>
        </View>
        
        {/* Players List */}
        <View style={styles.playersList}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {players.length === 0 ? (
              <Text>No players saved yet.</Text>
            ) : (
              players.map(player => {
                const teammate = player.teammatePreference ? players.find(p => p.id === player.teammatePreference) : undefined;
                return (
                  <Swipeable
                    ref={(ref) => { swipeableRefs.current[player.id] = ref; }}
                    key={player.id}
                    renderRightActions={() => (
                      <View style={styles.swipeActions}>
                        <IconButton icon="pencil" onPress={() => handleEditPlayer(player.id)} />
                        <IconButton icon="delete" iconColor={colors.error} onPress={() => handleDeletePlayer(player.id)} />
                      </View>
                    )}
                  >
                    <PlayerListItem
                      player={player}
                      rightIcon="chevron-left"
                      onRightIconPress={() => swipeableRefs.current[player.id]?.openRight()}
                      showSkillLevel={true}
                      teammatePreference={teammate}
                    />
                  </Swipeable>
                );
              })
            )}
          </ScrollView>
        </View>
        
        <Portal>
          <Modal visible={modalVisible} onDismiss={handlePlayerFormCancel} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}> 
            <View style={sharedStyles.modalHeader}>
              <View style={{ flex: 1 }} />
              <IconButton
                icon="close"
                size={24}
                onPress={handlePlayerFormCancel}
                style={sharedStyles.closeButton}
              />
            </View>
            <PlayerForm
              initialValues={editPlayerId ? players.find(p => p.id === editPlayerId) : undefined}
              onSubmit={handlePlayerFormSubmit}
              onCancel={handlePlayerFormCancel}
              title={editPlayerId ? 'Edit Player' : 'Add Player'}
              submitLabel={editPlayerId ? 'Save Changes' : 'Add Player'}
              onImport={handleImportPlayers}
              showImportButton={!editPlayerId}
            />
          </Modal>

          {/* Import Modal */}
          <Modal visible={importModalVisible} onDismiss={handleImportCancel} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
            <View style={sharedStyles.modalHeader}>
              <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Import Players</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={handleImportCancel}
                style={sharedStyles.closeButton}
              />
            </View>
            <ScrollView style={{ maxHeight: screenHeight * 0.7 }}>
              <Text variant="bodyMedium" style={{ marginBottom: 16, color: colors.onSurface }}>
                Paste the JSON data for the players you want to import:
              </Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={10}
                value={importText}
                onChangeText={setImportText}
                placeholder="Paste JSON data here..."
                style={{ marginBottom: 16 }}
                textColor={colors.onSurface}
                outlineColor={colors.outline}
                activeOutlineColor={colors.primary}
              />
              {importError ? (
                <Text style={{ color: colors.error, marginBottom: 16 }}>{importError}</Text>
              ) : null}
              <Text variant="bodySmall" style={{ marginBottom: 16, opacity: 0.7, color: colors.onSurface }}>
                Expected format: [{'{"firstName": "string", "lastName": "string (optional)", "skillLevel": "string", ...}'}]
              </Text>
              <Button mode="contained" onPress={handleImportSubmit} style={[{ marginBottom: 12 }, sharedStyles.cardBorderRadius]} buttonColor={colors.primary} textColor={colors.onPrimary}>
                Import Players
              </Button>
              <Button mode="outlined" onPress={handleImportCancel} style={[{ borderColor: colors.error }, sharedStyles.cardBorderRadius]} textColor={colors.error}>
                Cancel
              </Button>
            </ScrollView>
          </Modal>

          {/* Export Modal */}
          <Modal visible={exportModalVisible} onDismiss={() => setExportModalVisible(false)} contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}>
            <View style={sharedStyles.modalHeader}>
              <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Export Players</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setExportModalVisible(false)}
                style={sharedStyles.closeButton}
              />
            </View>
            <ScrollView style={{ maxHeight: screenHeight * 0.8 }}>
              <Text variant="bodyMedium" style={{ marginBottom: 16, color: colors.onSurface }}>
                Copy the JSON data below to export your players:
              </Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={15}
                value={importText}
                editable={false}
                style={{ marginBottom: 16 }}
                textColor={colors.onSurface}
                outlineColor={colors.outline}
                activeOutlineColor={colors.primary}
              />
              <Text variant="bodySmall" style={{ marginBottom: 16, opacity: 0.7, color: colors.onSurface }}>
                You can copy this data and save it to a file, or share it with others to import into their app.
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button 
                  mode="contained" 
                  icon="content-copy"
                  onPress={handleCopyToClipboard} 
                  style={[{ flex: 1, marginRight: 8 }, sharedStyles.cardBorderRadius]} 
                  buttonColor={colors.primary} 
                  textColor={colors.onPrimary}
                >
                  Copy
                </Button>
                <Button 
                  mode="contained" 
                  icon="share"
                  onPress={handleSharePlayers} 
                  style={[{ flex: 1, marginLeft: 8 }, sharedStyles.cardBorderRadius]} 
                  buttonColor={colors.secondary} 
                  textColor={colors.onSecondary}
                >
                  Share
                </Button>
              </View>
              <Button mode="outlined" onPress={() => setExportModalVisible(false)} style={[{ marginTop: 12, borderColor: colors.primary }, sharedStyles.cardBorderRadius]} textColor={colors.primary}>
                Close
              </Button>
            </ScrollView>
          </Modal>
        </Portal>
      </View>
    </SafeAreaView>
  );
} 