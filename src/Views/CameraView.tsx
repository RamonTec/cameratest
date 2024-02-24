import React, {useRef, useState, useCallback, useMemo} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import {
  Camera,
  PhotoFile,
  TakePhotoOptions,
  useCameraDevice,
  useCameraFormat,
  VideoFile,
} from 'react-native-vision-camera';
import {useFocusEffect} from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Video from 'react-native-video';
import Animated, {ZoomIn, ZoomOut} from 'react-native-reanimated';
import { ModalComponent } from '../Components/Modal';

const CameraComponent = () => {
  const [photo, setPhoto] = useState<PhotoFile>(null);
  const [video, setVideo] = useState<VideoFile>(null);
  const [isActive, setIsActive] = useState(false);
  const [flashCamera, setFlash] = useState<TakePhotoOptions['flash']>('off');
  const [hdrEnabled, setHdrEnabled] = useState(false);
  const [soundEnabled, setsoundEnabled] = useState(true);
  const [changeDevice, setChangeDevice] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [capturing, setCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [typeCamera, setTypeCamera] = useState('photo');
  const [fps, setFps] = useState(30);
  const [modalFps, seModalFps] = useState(false);

  const videoRef = useRef(null);
  const camera = useRef<Camera>(null);

  let device = useCameraDevice('back', {
    physicalDevices: ['ultra-wide-angle-camera'],
  });

  if (!changeDevice) {
    device = useCameraDevice('back', {
      physicalDevices: ['ultra-wide-angle-camera'],
    });
  }

  if (changeDevice) {
    device = useCameraDevice('front', {
      physicalDevices: ['wide-angle-camera'],
    });
  }

  const screenAspectRatio = Dimensions.get('window').width / Dimensions.get('screen').height;
  const format = useCameraFormat(device, [
    { fps: fps },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ]);

  const supportsFlash = device?.hasFlash ?? false;
  const supportsHdr = format?.supportsPhotoHdr;
  const supports60Fps = useMemo(() => device?.formats.some((f) => f.maxFps >= 60), [device?.formats]);
  const handleFps = Math.min(format?.maxFps ?? 1, fps);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setPhoto(null);
        setVideo(null);
        setIsActive(false);
      };
    }, []),
  );

  const onTakePhoto = async () => {

    if (isRecording) {
      camera.current?.stopRecording();
      return;
    }
    try {
      setCapturing(true);
      const photo = await camera.current?.takePhoto({
        flash: supportsFlash ? flashCamera : 'off',
        enableShutterSound: soundEnabled,
        qualityPrioritization: 'speed',
      });
      const timestamp = new Date().getTime();
      const fileName = `capturedImage_${timestamp}.jpg`;
      if (photo) {
        const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.copyFile(photo.path, destinationPath);
        setCapturedImageUri(destinationPath);
        setPhoto(destinationPath);
        setVideo(null);
        await CameraRoll.saveToCameraRoll(destinationPath);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    } finally {
      setCapturing(false);
    }
  };

  const onStartRecording = async () => {
    if (!camera.current) {
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      camera.current.stopRecording();
      return;
    }
    setIsRecording(true);
    camera.current?.startRecording({
      onRecordingFinished: async (video) => {
        setIsRecording(false);
        if (video) {
          const timestamp = new Date().getTime();
          const fileName = `capturedImage_${timestamp}.mov`;
          const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
          await RNFS.copyFile(video.path, destinationPath);
          setCapturedImageUri(destinationPath);
          setVideo(destinationPath);
          setPhoto(null);
          await CameraRoll.saveToCameraRoll(destinationPath);
        }
      },
      onRecordingError: (error) => {
        console.error(error);
        setIsRecording(false);
      }
    });
  }

  const openImage = () => {
    if (capturedImageUri) {
      setModalVisible(true);
    }
  };

  const closeImage = () => {
    setModalVisible(false);
  };

  const handleZoom = (level: React.SetStateAction<number>) => {
    setZoomLevel(level);
  };

  const showModalFps = () => {
    seModalFps(!modalFps);
  }

  if (!device) {
    return <Text style={{color: 'black'}}>Camera device not found</Text>;
  }

  return (
    <View style={{flex: 1}}>
      <Camera
        ref={camera}
        style={Styles.Camera}
        device={device}
        isActive={isActive}
        photo
        video
        audio
        videoHdr={hdrEnabled}
        zoom={zoomLevel}
        photoHdr={hdrEnabled}
        format={format}
        fps={handleFps}
      />

      <View
        style={Styles.stylesActionTop}>
        {supportsHdr && (
          <Icon
            onPress={() => setHdrEnabled(!hdrEnabled)}
            name={!hdrEnabled ? 'hdr-off' : 'hdr'}
            size={30}
            color="white"
          />
        )}
        {supportsFlash && (
          <Icon
            onPress={() =>
              setFlash(curValue => (curValue === 'off' ? 'on' : 'off'))
            }
            name={flashCamera === 'off' ? 'flash-off' : 'flash'}
            size={30}
            color="white"
          />
        )}
        <Icon
          onPress={() => setsoundEnabled(!soundEnabled)}
          name={!soundEnabled ? 'volume-off' : 'volume-high'}
          size={30}
          color="white"
        />
        {supports60Fps && (
          <TouchableOpacity onPress={showModalFps}>
            <Text style={{ fontSize: 15, marginTop: 4, fontWeight: 700 }}>{fps} fps</Text>
          </TouchableOpacity>
        )}
      </View>

      {photo && (
        <View style={Styles.photoViewMiniatura}>
          <TouchableOpacity onPress={openImage}>
            <Image
              source={{uri: `file://${capturedImageUri}`}}
              style={Styles.miniatura}
            />
          </TouchableOpacity>
        </View>
      )}

      {video && (
        <View style={Styles.photoViewMiniatura}>
          <TouchableOpacity onPress={openImage}>
            <Image
              source={{uri: `file://${capturedImageUri}`}}
              style={Styles.miniatura}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={Styles.viewZoom}>
        <TouchableOpacity onPress={() => handleZoom(0)} style={Styles.zoomButton}>
          <Text style={Styles.buttonText}>0x</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleZoom(5)} style={Styles.zoomButton}>
          <Text style={Styles.buttonText}>5x</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleZoom(10)} style={Styles.zoomButton}>
          <Text style={Styles.buttonText}>10x</Text>
        </TouchableOpacity>
      </View>

      <View style={Styles.viewZoomOptions}>
        <TouchableOpacity onPress={() => setTypeCamera('video')} style={[Styles.zoomButtonOptions, typeCamera === 'video' ? Styles.activeMod : null ]}>
          <Text style={Styles.buttonText}>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTypeCamera('photo')} style={[Styles.zoomButtonOptions, typeCamera === 'photo' ? Styles.activeMod : null ]}>
          <Text style={Styles.buttonText}>Camara</Text>
        </TouchableOpacity>
      </View>

      { 
        typeCamera === 'photo' && (
          <Pressable onPress={onTakePhoto} 
          style={[
            Styles.captureButton,
            isRecording ? Styles.recordingActive : Styles.recordingNoActive,
          ]}>
            <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <View style={Styles.isNotGrabing}></View>
            </Animated.View>
          </Pressable>
        )
      }

      { 
        typeCamera === 'video' && (
          <Pressable onPress={onStartRecording} 
          style={[
            Styles.captureButton,
            isRecording ? Styles.recordingActive : Styles.recordingNoActive,
          ]}>
            <Animated.View entering={ZoomIn} exiting={ZoomOut}>
              <View style={Styles.isGrabing}></View>
            </Animated.View>
          </Pressable>
        )
      }

      <Icon
        style={Styles.reverseStyle}
        onPress={() => setChangeDevice(!changeDevice)}
        name={'cached'}
        size={40}
        color="white"
      />

      <ModalComponent
        closeModal={closeImage}
        visible={modalVisible}
      >
        <View style={Styles.modalContainer}>
          <TouchableOpacity onPress={closeImage} style={Styles.closeButton}>
            <Icon
              style={Styles.reverseStyle}
              onPress={() => setChangeDevice(!changeDevice)}
              name={'close'}
              size={40}
              color="white"
            />
          </TouchableOpacity>

          {video && (
            <Video 
              source={{uri: `file://${capturedImageUri}`}}
              ref={videoRef}
              style={Styles.expandedImage} 
              paused={false}
            />
          )}

          {photo && (
            <Image source={{uri: `file://${capturedImageUri}`}} style={Styles.expandedImage} />
          )}
        </View>
      </ModalComponent>

      <ModalComponent
        closeModal={showModalFps}
        visible={modalFps}
      >
        <Text style={{ marginBottom: 10, fontSize: 20 }}>Selecciona FPS para grabar</Text>
        <TouchableOpacity style={Styles.fpsStyleButton} onPress={() => {setFps(30); showModalFps()}}>
          <Text>30 fps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.fpsStyleButton} onPress={() => {setFps(60); showModalFps()}}>
          <Text>60 fps</Text>
        </TouchableOpacity>
      </ModalComponent>

      {capturing && (
        <View style={Styles.captureEffect}></View>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  fpsStyleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 10,
    margin: 2,
    borderRadius: 5
  },
  modalContainerFps: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeMod: {
    backgroundColor: 'rgba(225, 0, 0, 0.2)',
  },
  zoomButtonOptions: {
    borderRadius: 75,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: 100,
    height: 40
  },
  viewZoom: {
    position: 'absolute', 
    flex: 0, 
    flexDirection: 'row', 
    alignSelf: 'center', 
    bottom: 130, 
    gap: 10
  },
  viewZoomOptions: {
    position: 'absolute', 
    flex: 0, 
    flexDirection: 'row', 
    alignSelf: 'center', 
    bottom: 180, 
    gap: 10
  },
  isGrabing: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    color: 'red',
    fontSize: 45,
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: 'darkred',
  },
  isNotGrabing: {
    display: 'none',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImage: {
    position: 'absolute',
    zIndex: 1000000,
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  captureEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stylesActionTop: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
    padding: 8,
    position: 'absolute',
    flex: 0,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 20,
    top: 30,
  },
  photoViewMiniatura: {
    position: 'absolute',
    flex: 0,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 20,
    left: 40,
    bottom: 50
  },
  miniatura: {
    width: 50, 
    height: 50, 
    borderRadius: 75, 
    borderWidth: 2, 
    borderColor: 'white',
  },
  zoomButton: {
    borderRadius: 75,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: 40,
    height: 40
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    marginTop: 3,
    marginRight: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  Camera: {
    width: '100%',
    height: '100%',
  },
  reverseStyle: {
    flex: 0,
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 55,
    width: 40,
    height: 40,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    right: 55
  },
  recordingActive: {
    backgroundColor: '#e1e1e1',
  },
  recordingNoActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureButton: {
    flex: 0,
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 50,
    width: 60,
    height: 60,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'white'
  },
});

export default CameraComponent;
