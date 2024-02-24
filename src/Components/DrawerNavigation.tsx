import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {DrawerStackParams} from './navigation-models';
import CameraView from '../Views/CameraView';
import IndexView from '../Views/IndexView';
import DrawerContent from '@react-navigation/drawer';

const Drawer = createDrawerNavigator<DrawerStackParams>();

export const DrawerNavigation: React.FC = () => {
  return (
    <Drawer.Navigator
      initialRouteName={IndexView}
      drawerContent={DrawerContent}>
      <Drawer.Screen
        name="DashBoard"
        component={IndexView}
      />
      <Drawer.Screen
      options={{
        headerShown: false
      }}
        name="CameraList"
        component={CameraView}
      />
    </Drawer.Navigator>
  );
};
