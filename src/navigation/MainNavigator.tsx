import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TeamsScreen from '../screens/TeamsScreen';
import PlayersScreen from '../screens/PlayersScreen';
import TournamentScreen from '../screens/TournamentScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Teams"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Teams') iconName = 'account-group';
          else if (route.name === 'Players') iconName = 'account';
          else if (route.name === 'Tournaments') iconName = 'trophy';
          // TypeScript workaround: iconName is a valid string but not typed as a union of allowed names
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Players" component={PlayersScreen} />
      <Tab.Screen name="Tournaments" component={TournamentScreen} />
    </Tab.Navigator>
  );
} 