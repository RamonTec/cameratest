import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationStackParams} from './navigation-models';
import {DrawerNavigation} from './DrawerNavigation.tsx';

const Stack = createNativeStackNavigator<NavigationStackParams>();
export const Navigation: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ contentStyle: { backgroundColor: '#fff' } }}>
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigation}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
