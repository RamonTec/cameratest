import {
  Camera,
  useCameraDevice,
  CameraProps,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import React, {useCallback, useState} from 'react';
import {
  Button,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

function App() {
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>('not-determined');
  const device = useCameraDevice('front');
  const zoom = useSharedValue(device.neutralZoom);

  const zoomOffset = useSharedValue(0);
  const gesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value;
    })
    .onUpdate(event => {
      const z = zoomOffset.value * event.scale;
      zoom.value = interpolate(
        z,
        [1, 10],
        [device.minZoom, device.maxZoom],
        Extrapolation.CLAMP,
      );
    });

  const requestCameraPermission = useCallback(async () => {
    console.log('Requesting camera permission...');
    const permission = await Camera.requestCameraPermission();
    console.log(`Camera permission status: ${permission}`);

    if (permission === 'denied') {
      await Linking.openSettings();
    }
    setCameraPermissionStatus(permission);
  }, []);

  const animatedProps = useAnimatedProps<CameraProps>(
    () => ({zoom: zoom.value}),
    [zoom],
  );

  if (device == null) {
    return null;
  }
  return (
    <GestureHandlerRootView>
      <SafeAreaView>
        <View>
          <Text>Camera test</Text>
          <Text>Camera permission: {cameraPermissionStatus}</Text>
          <Button
            title="Request permission"
            onPress={() => requestCameraPermission()}
          />

          <GestureDetector gesture={gesture}>
            <ReanimatedCamera
              style={Styles.Camera}
              device={device}
              isActive={true}
              animatedProps={animatedProps}
            />
          </GestureDetector>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const Styles = StyleSheet.create({
  Camera: {
    width: '100%',
    height: '100%',
  },
});

export default App;
