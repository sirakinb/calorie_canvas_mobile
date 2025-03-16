import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { Camera as ExpoCamera, CameraType as ExpoCameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface CameraScreenProps {
  onPhotoTaken: (uri: string) => void;
  onClose: () => void;
}

export default function CameraScreen({ onPhotoTaken, onClose }: CameraScreenProps) {
  const [type, setType] = useState<ExpoCameraType>(ExpoCameraType.back);
  const cameraRef = useRef<ExpoCamera>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: true,
        });
        onPhotoTaken(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const toggleCameraType = () => {
    setType(current => (current === ExpoCameraType.back ? ExpoCameraType.front : ExpoCameraType.back));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoCamera
        ref={cameraRef}
        type={type}
        style={styles.camera}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <View style={styles.captureButton} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </ExpoCamera>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: '#666',
  },
}); 