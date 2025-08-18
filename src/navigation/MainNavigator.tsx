import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import TeamsScreen from '../screens/TeamsScreen';
import PlayersScreen from '../screens/PlayersScreen';
// import TournamentScreen from '../screens/TournamentScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { colors } = useTheme();
  const { height: screenHeight } = Dimensions.get('window');
  
  // Calculate safe area for devices with home indicator
  const isIPhoneWithHomeIndicator = Platform.OS === 'ios' && screenHeight >= 812;
  const tabBarHeight = isIPhoneWithHomeIndicator ? 88 : 60;

  return (
    <Tab.Navigator
      initialRouteName="Teams"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: isIPhoneWithHomeIndicator ? 28 : 8,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          borderTopWidth: 0.5,
          elevation: 8,
          shadowColor: colors.onSurface,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = '';
          if (route.name === 'Teams') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Players') {
            iconName = focused ? 'account-multiple' : 'account-multiple-outline';
          }
          // } else if (route.name === 'Tournaments') {
          //   iconName = focused ? 'trophy' : 'trophy-outline';
          // }
          return (
            <MaterialCommunityIcons 
              name={iconName as any} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Teams" 
        component={TeamsScreen}
        options={{
          tabBarLabel: 'Teams',
        }}
      />
      <Tab.Screen 
        name="Players" 
        component={PlayersScreen}
        options={{
          tabBarLabel: 'Players',
        }}
      />
      {/* <Tab.Screen 
        name="Tournaments" 
        component={TournamentScreen}
        options={{
          tabBarLabel: 'Tournaments',
        }}
      /> */}
    </Tab.Navigator>
  );
} 