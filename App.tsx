import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import {Root} from './src/Root';

export function App(): React.ReactElement | null {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={styles.root}>
        <Root />
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
