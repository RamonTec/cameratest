import React, { useEffect } from 'react';
import {View, Button} from 'react-native';
import { useMicrophonePermission, useCameraPermission } from 'react-native-vision-camera';

function IndexView({navigation}) {
  const {hasPermission, requestPermission} = useCameraPermission();
  const {hasPermission: microphonePermission, requestPermission: requestMicrophonePermission} = useMicrophonePermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }

    if (!microphonePermission) {
      requestMicrophonePermission();
    }
  }, [hasPermission, microphonePermission]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button title="Go to Camera" onPress={() => navigation.navigate('CameraList')} />
    </View>
  );
}

export default IndexView;
