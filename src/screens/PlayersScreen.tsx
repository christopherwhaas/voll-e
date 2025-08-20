import * as React from 'react';
import { View, ScrollView, Dimensions, Alert, Clipboard, Share, Platform } from 'react-native';
import { Text, List, FAB, Portal, Modal, IconButton, useTheme, Card, Button, TextInput } from 'react-native-paper';
import { useAppState } from '../models/AppStateContext';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import PlayerForm, { PlayerFormValues } from '../components/PlayerForm';
import PlayerFormDrawer from '../components/PlayerFormDrawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayerListItem from '../components/PlayerListItem';
import GroupSelector from '../components/GroupSelector';
import GroupForm, { GroupFormValues } from '../components/GroupForm';
import styles from '../styles/PlayersScreenStyles';
import { sharedStyles } from '../styles/shared';
import { Player, Group } from '../models/types';

export default function PlayersScreen() {
  const { players, setPlayers, groups, setGroups, getAllGroups } = useAppState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editPlayerId, setEditPlayerId] = React.useState<string | null>(null);
  const [importModalVisible, setImportModalVisible] = React.useState(false);
  const [exportModalVisible, setExportModalVisible] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [importError, setImportError] = React.useState('');
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<string[]>(['all']);
  const [groupModalVisible, setGroupModalVisible] = React.useState(false);
  const [groupManagementModalVisible, setGroupManagementModalVisible] = React.useState(false);
  const [editGroupId, setEditGroupId] = React.useState<string | null>(null);
  const swipeableRefs = React.useRef<{ [key: string]: any }>({});
  const { height: screenHeight } = Dimensions.get('window');
  const { colors } = useTheme();

  // Filter players based on selected groups
  const filteredPlayers = React.useMemo(() => {
    if (selectedGroupIds.includes('all')) {
      return players;
    }
    
    // Combine all selected groups' player IDs and remove duplicates
    const allPlayerIds = new Set<string>();
    const allGroups = getAllGroups();
    selectedGroupIds.forEach(groupId => {
      const group = allGroups.find(g => g.id === groupId);
      if (group) {
        group.playerIds.forEach(playerId => allPlayerIds.add(playerId));
      }
    });
    
    return players.filter(player => allPlayerIds.has(player.id));
  }, [players, getAllGroups, selectedGroupIds]);

  const handlePlayerFormSubmit = (data: PlayerFormValues) => {
    if (editPlayerId) {
      // Update existing player
      setPlayers(players.map(p => p.id === editPlayerId ? { ...p, ...data } : p));
    } else {
      // Create new player
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
    // Remove player from all groups (except "All" group which is managed automatically)
    setGroups(groups.map(group => {
      if (group.id === 'all') return group; // Don't modify "All" group
      return {
        ...group,
        playerIds: group.playerIds.filter(playerId => playerId !== id)
      };
    }));
  };

  const handleEditPlayer = (id: string) => {
    setEditPlayerId(id);
    setModalVisible(true);
  };

  const handleAddPlayer = () => {
    setEditPlayerId(null);
    setModalVisible(true);
  };

  const handleGroupFormSubmit = (data: GroupFormValues) => {
    if (editGroupId) {
      setGroups(groups.map(g => g.id === editGroupId ? { ...g, ...data } : g));
    } else {
      const id = Math.random().toString(36).slice(2, 10);
      setGroups([...groups, { id, ...data }]);
    }
    setGroupModalVisible(false);
    setEditGroupId(null);
  };

  const handleGroupFormCancel = () => {
    setGroupModalVisible(false);
    setEditGroupId(null);
  };

  const handleAddGroup = () => {
    setEditGroupId(null);
    setGroupModalVisible(true);
  };

  const handleOpenGroupManagement = () => {
    setGroupManagementModalVisible(true);
  };

  const handleEditGroup = (groupId: string) => {
    setEditGroupId(groupId);
    setGroupModalVisible(true);
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupIds(currentIds => {
      if (groupId === 'all') {
        // If "All" is selected, clear other selections
        const newIds = ['all'];
        return newIds;
      }
      
      if (currentIds.includes(groupId)) {
        // Remove from selection
        const newIds = currentIds.filter(id => id !== groupId);
        // If no groups selected, default to "All"
        const finalIds = newIds.length === 0 ? ['all'] : newIds;
        return finalIds;
      } else {
        // Add to selection, remove "All" if it was selected
        const newIds = [...currentIds.filter(id => id !== 'all'), groupId];
        return newIds;
      }
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    if (groupId === 'all') {
      Alert.alert('Cannot Delete', 'The "All" group cannot be deleted.');
      return;
    }
    
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This will remove all players from the group but won\'t delete the players themselves.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setGroups(groups.filter(g => g.id !== groupId));
            if (selectedGroupIds.includes(groupId)) {
              setSelectedGroupIds(['all']);
            }
          }
        }
      ]
    );
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
    <SafeAreaView style={{ flex: 1 }} edges={['top','left','right']}>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text variant="headlineMedium" style={[styles.screenTitle, { color: colors.onBackground }]}>
            Players
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="account-group"
              size={24}
              onPress={handleOpenGroupManagement}
              style={styles.addButton}
            />
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

        {/* Group Selector */}
        <GroupSelector
          groups={[]} // Pass empty array since GroupSelector now uses getAllGroups internally
          selectedGroupIds={selectedGroupIds}
          onSelectGroup={handleSelectGroup}
          onAddGroup={handleAddGroup}
          multiSelect={true}
        />
        
        {/* Players List */}
        <View style={[styles.playersList, { flex: 1 }]}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {filteredPlayers.length === 0 ? (
              <Text>No players in this group.</Text>
            ) : (
              filteredPlayers.map(player => {
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
          <PlayerFormDrawer
            visible={modalVisible}
            onDismiss={handlePlayerFormCancel}
            initialValues={editPlayerId ? players.find(p => p.id === editPlayerId) : undefined}
            onSubmit={handlePlayerFormSubmit}
            onCancel={handlePlayerFormCancel}
            title={editPlayerId ? 'Edit Player' : 'Add Player'}
            submitLabel={editPlayerId ? 'Save Changes' : 'Add Player'}
            onImport={handleImportPlayers}
            showImportButton={!editPlayerId}
          />

          {/* Group Management Modal */}
          <Modal 
            visible={groupManagementModalVisible} 
            onDismiss={() => setGroupManagementModalVisible(false)} 
            contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}
          >
            <View style={sharedStyles.modalHeader}>
              <Text variant="titleLarge" style={[sharedStyles.modalTitle, { color: colors.onBackground }]}>Manage Groups</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setGroupManagementModalVisible(false)}
                style={sharedStyles.closeButton}
              />
            </View>
            <ScrollView 
              style={{ maxHeight: screenHeight * 0.7 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ padding: 16 }}>
                <Button 
                  mode="contained" 
                  icon="plus"
                  onPress={() => {
                    setGroupManagementModalVisible(false);
                    setTimeout(() => setGroupModalVisible(true), 100);
                  }}
                  style={[{ marginBottom: 16 }, sharedStyles.cardBorderRadius]}
                  buttonColor={colors.primary}
                  textColor={colors.onPrimary}
                >
                  Create New Group
                </Button>
                
                {groups.length === 0 ? (
                  <Text style={{ textAlign: 'center', fontStyle: 'italic', opacity: 0.6, marginTop: 20 }}>
                    No groups created yet. Create your first group above.
                  </Text>
                ) : (
                  groups.map(group => (
                    <View 
                      key={group.id} 
                      style={[
                        styles.groupManagementItem, 
                        { 
                          backgroundColor: colors.surface,
                          borderColor: colors.outline
                        }
                      ]}
                    >
                      <View style={styles.groupManagementInfo}>
                        <Text variant="titleMedium" style={{ color: colors.onBackground, fontWeight: '500' }}>
                          {group.name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {group.playerIds.length} player{group.playerIds.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.groupManagementActions}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => {
                            setEditGroupId(group.id);
                            setGroupManagementModalVisible(false);
                            setTimeout(() => setGroupModalVisible(true), 100);
                          }}
                          iconColor={colors.primary}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => {
                            setGroupManagementModalVisible(false);
                            setTimeout(() => handleDeleteGroup(group.id), 100);
                          }}
                          iconColor={colors.error}
                        />
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </Modal>

          {/* Group Form Modal */}
          <Modal 
            visible={groupModalVisible} 
            onDismiss={handleGroupFormCancel} 
            contentContainerStyle={[sharedStyles.modalStyle, { backgroundColor: colors.background }, sharedStyles.cardBorderRadius]}
          >
            <GroupForm
              initialValues={editGroupId ? groups.find(g => g.id === editGroupId) : undefined}
              onSubmit={handleGroupFormSubmit}
              onCancel={handleGroupFormCancel}
              title={editGroupId ? 'Edit Group' : 'Add Group'}
              submitLabel={editGroupId ? 'Save Changes' : 'Add Group'}
              players={players}
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