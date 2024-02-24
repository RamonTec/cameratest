import React from 'react';
import {
  DrawerItemList,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';

export const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => (
  <DrawerContentScrollView {...props}>
    <DrawerItemList {...props} />
  </DrawerContentScrollView>
);
