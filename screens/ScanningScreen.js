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
  const [scanned, setScanned] = useState(false); // Added state for barcode scanning
  const [showMessage, setShowMessage] = useState(false); // Added state for displaying message
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

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) {
      // If already scanned, display a message
      setShowMessage(true);
    } else {
      setScanned(true);
      // Do something with the barcode data (e.g., navigate to a new screen, display the data, etc.)
      console.log(`Bar code with type ${type} and data ${data} has been scanned.`);
    }
  };

  const hideMessage = () => {
    setShowMessage(false);
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

// KORVAA ALLA OLEVA SEURAAVALLA JOS HALUAT SKANNATA KOODIN VAIN KERRAN: onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
// KORVAA ALLA OLEVA SEURAAVALLA JOS HALUAT SKANNATA KOODIN USEASTI: onBarCodeScanned={handleBarCodeScanned}
// ---------------------------------------------------------------
          onBarCodeScanned={handleBarCodeScanned}
// ---------------------------------------------------------------

          // Limit the scanning area inside the frame
    //      cameraViewDimensions={{ width: 100, height: 100 }} // Set your desired dimensions
    //      rectOfInterest={{ x: 0.1, y: 0.2, width: 0.1, height: 0.1 }} // Adjust these values
        >
        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleCameraSwitch} style={styles.cameraSwitchButton}>
              <Ionicons name="ios-camera-reverse" size={40} color="white" />
            </TouchableOpacity>
        </View>
        <View style={styles.scannerFrame} />
        </Camera>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Placeholder content or empty view */}
        </View>
      )}

{/* ALLA OLEVA NÄYTTÄÄ VIESTIN, JOS SKANNATTU KOODI ON JO SKANNATTU AIEMMIN. VOI TESTEISSÄ KOMMENTOIDA POIS */}
{/* --------------------------------------------------------------- */}
      {showMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>You scanned the same code again.</Text>
          <TouchableOpacity onPress={hideMessage} style={styles.hideMessageButton}>
            <Text style={styles.hideMessageText}>OK</Text>
          </TouchableOpacity>
        </View>
      )}
{/* --------------------------------------------------------------- */}

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
    scannerFrame: {
      position: 'absolute',
      top: '10%', // Adjust the top position to center vertically
      left: '10%', // Adjust the left position to center horizontally
      width: '80%', // Adjust the width to make it smaller
      height: '85%', // Adjust the height to make it smaller
      borderColor: 'teal',
      borderWidth: 4,
      borderRadius: 30,
    },
    messageContainer: {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: 20,
      borderRadius: 10,
      top: '40%',
      left: '10%',
      right: '10%',
      alignItems: 'center',
    },
    messageText: {
      fontSize: 18,
      textAlign: 'center',
    },
    hideMessageButton: {
      backgroundColor: 'teal',
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
    },
    hideMessageText: {
      color: 'white',
      fontSize: 16,
    },
  });