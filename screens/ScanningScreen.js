import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from Expo vector icons

export default function ScanningScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [cameraActive, setCameraActive] = useState(true);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused(); // Check if the screen is focused

  useEffect(() => {
    if (isFocused) {
      setCameraActive(true);
    } else {
        setCameraActive(false);
        }
  }, [isFocused]);

  useEffect(() => {
    if (cameraActive) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
      })();
    }
  }, [cameraActive]);

  useEffect(() => {
    if (cameraActive) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasCameraPermission(status === 'granted');
      })();
    }
  }, [cameraActive]);
  

  const handleCameraSwitch = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  if (hasCameraPermission === null) {
    return <View />;
  }

  if (hasCameraPermission === false) {
    return <Text>No access to the camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {cameraActive ? (
        <Camera
          style={{ flex: 1 }}
          type={type}
          ref={cameraRef}
        >
        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleCameraSwitch} style={styles.cameraSwitchButton}>
              <Ionicons name="ios-camera-reverse" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Placeholder content or empty view */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    buttonContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'top',
      paddingTop: 20,
    },
    cameraSwitchButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });