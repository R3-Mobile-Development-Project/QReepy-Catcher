import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from Expo vector icons
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import ScanningModal from '../modals/ScanningModal';
import { findMonster, fetchMonsterDetails, fetchMonsterImageURL } from '../utils/monsterUtils';

export default function ScanningScreen({ navigation }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [cameraActive, setCameraActive] = useState(true);
  const [scanned, setScanned] = useState(false); // Added state for barcode scanning
  const [showMessage, setShowMessage] = useState(false); // Added state for displaying message
  const [torchOn, setTorchOn] = useState(Camera.Constants.FlashMode.off); // Added state for torch
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused(); // Check if the screen is focused
  const [modalVisible, setModalVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(0); // Added state for slider value
  const [monsterInfo, setMonsterInfo] = useState({});
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
      setCameraActive(true);
      }, 200);
    } else {
        setCameraActive(false);
        setScanned(false); // Reset the scanned state when the screen is not focused
        setShowMessage(false); // Reset the message state when the screen is not focused
        setTorchOn(Camera.Constants.FlashMode.off); // Reset the torch state when the screen is not focused
        setZoom(0);
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

  const playTorchSound = async () => {
    const torchSound = new Audio.Sound();

    try {
      const torchSource = require('../assets/sounds/wall.wav'); // Replace with your torch sound file path
      await torchSound.loadAsync(torchSource);
      await torchSound.playAsync();
    } catch (error) {
      console.error('Error playing torch sound:', error);
    }
  };

  const handleTorchToggle = () => {
    playTorchSound(); // Call the function to play the torch sound
    setTimeout(() => {
    setTorchOn(
      torchOn === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
    }, 300);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) {
      setShowMessage(true);
      console.log(`Bar code with type ${type} and data ${data} has been scanned.`);

    } else {
      const foundMonsterId = findMonster();
      if (foundMonsterId >= 1 && foundMonsterId <= 50) {
        setScanned(true);
        console.log(`FOUND MONSTER WITH ID: ${foundMonsterId}`);

        try {
          const fetchedMonsterInfo = await fetchMonsterDetails(foundMonsterId);
          const fetchedImageURL = await fetchMonsterImageURL(foundMonsterId);

          setMonsterInfo(fetchedMonsterInfo);
          setImageURL(fetchedImageURL);

          openModal();
          console.log(`Bar code with type ${type} and data ${data} has been scanned.`);
        } catch (error) {
          console.error('Error fetching monster details:', error);
          setShowMessage(true);
        }
      } else {
        setShowMessage(true);
        console.log(`Viimeinen else`)
      }
    }
  };

  const playButtonSound = async () => {
    const buttonSound = new Audio.Sound();

    try {
      const buttonSource = require('../assets/sounds/Menu_Selection_Click.wav'); // Replace with your button sound file path
      await buttonSound.loadAsync(buttonSource);
      await buttonSound.playAsync();
    } catch (error) {
      console.error('Error playing button sound:', error);
    }
  }

  const hideMessage = () => {
    setShowMessage(false);
  };

  const handleZoomChange = (value) => {
    setSliderValue(value);
    setZoom(value);
  };

  const openModal = () => {
    setModalVisible(true);
    setShowMessage(false);
  };

  const closeModal = () => {
    playButtonSound(); // Play button sound on close button press
    setModalVisible(false);
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
          flashMode={torchOn}
          zoom={zoom}
          onBarCodeScanned={handleBarCodeScanned}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleTorchToggle} style={styles.torchToggleButton}>
              <Ionicons name={torchOn ? 'ios-flashlight' : 'ios-flashlight-outline'} size={40} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.scannerFrame} />
          <Slider
            style={{ width: '60%', marginVertical: 60, marginLeft: 80 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="teal"
            thumbTintColor="teal"
            value={sliderValue}
            onValueChange={handleZoomChange}
          />
        </Camera>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Placeholder content or empty view */}
        </View>
      )}

{/* ALLA OLEVA NÄYTTÄÄ VIESTIN, JOS SKANNATTU KOODI ON JO SKANNATTU AIEMMIN. VOI TESTEISSÄ KOMMENTOIDA POIS */}
{/* --------------------------------------------------------------- */}
     {/* {showMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>You scanned the same code again.</Text>
          <TouchableOpacity onPress={hideMessage} style={styles.hideMessageButton}>
            <Text style={styles.hideMessageText}>OK</Text>
          </TouchableOpacity>
        </View>
      )}*/}
{/* --------------------------------------------------------------- */}
      {modalVisible && (
      <ScanningModal
        isVisible={modalVisible}
        onClose={closeModal}
        openGallery={() => navigation.navigate('Gallery')}
        monsterInfo={monsterInfo}
        imageURL={imageURL}
      />
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
    torchToggleButton: {
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