import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from Expo vector icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import ScanningModal from '../modals/ScanningModal';
import { findMonster, fetchMonsterDetailsFromFirestore, fetchMonsterImageURL } from '../utils/monsterUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [noMonsterFound, setNoMonsterFound] = useState(false);
  const [resetScanner, setResetScanner] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [isDebouncingScan, setIsDebouncingScan] = useState(false);
  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [scanningMessage, setScanningMessage] = useState('');

  // Function to load the last 10 scanned barcodes from AsyncStorage
const loadScannedBarcodes = async () => {
  try {
    const storedBarcodes = await AsyncStorage.getItem('lastScannedBarcodes');
    if (storedBarcodes) {
      setScannedBarcodes(JSON.parse(storedBarcodes));
    }
  } catch (error) {
    console.error('Error loading scanned barcodes from AsyncStorage:', error);
  }
};

useEffect(() => {
  // Load the last 10 scanned barcodes when the component mounts
  loadScannedBarcodes();
}, []);

// Function to save the last 10 scanned barcodes to AsyncStorage
const saveScannedBarcodes = async () => {
  try {
    const slicedBarcodes = scannedBarcodes.slice(-10);
    await AsyncStorage.setItem('lastScannedBarcodes', JSON.stringify(slicedBarcodes));
    const savedBarcodes = await AsyncStorage.getItem('lastScannedBarcodes');
    console.log('SCANNINGSCREEN: Scanned barcodes saved to AsyncStorage:', savedBarcodes);
  } catch (error) {
    console.error('Error saving scanned barcodes to AsyncStorage:', error);
  }
};

  const initiateScanning = () => {
    setLastScannedData(null);
    setIsScanningActive(true);
    setIsDebouncingScan(false); // Reset debounce state
    setScanningMessage('SCANNING FOR QREEPS...');
    setShowMessage(true); // Show scanning message
  };

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
      setCameraActive(true);
      }, 200);
      setSliderValue(0);
      setZoom(0);
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
  if (!isScanningActive || isDebouncingScan || scannedBarcodes.includes(data)) return;

  // Check if scanned barcode is a duplicate to one in async storage
  


  console.log('SCANNINGSCREEN: Scanned barcode:', data, 'of type:', type);

  // Update the list of scanned barcodes
  setScannedBarcodes((prevScannedBarcodes) => [...prevScannedBarcodes, data]);

  // Save the last 10 scanned barcodes to AsyncStorage
  saveScannedBarcodes();

    setIsDebouncingScan(true); // Start debounce cooldown
    // Set a timeout to clear the debounce state after a short period
    setTimeout(() => setIsDebouncingScan(false), 2000); // Adjust the cooldown time as needed

    /*
    // Check for duplicate scans
    if (data === lastScannedData) {
      console.log('SCANNINGSCREEN: Duplicate scan detected');
      setScanningMessage('You scanned the same code again.');
      setShowMessage(true);
      setIsScanningActive(false); // Stop scanning after detecting a duplicate
      return;
    }
    */

    // Check if the scanned code matches one of the codes stored in AsyncStorage
    
  try {
    const storedCodes = await AsyncStorage.getItem('lastScannedBarcodes');
    if (storedCodes) {
      const storedCodesArray = JSON.parse(storedCodes);
      if (storedCodesArray.includes(data)) {
        // Code matches, display your message
        setScanningMessage('Code already scanned.');
        setShowMessage(true);
        setIsScanningActive(false);
        return;
      }
    }
  } catch (error) {
    console.error('Error checking stored codes:', error);
  }
  

    const foundMonsterId = findMonster(); // Assuming this function processes 'data' to find a monster

    if (foundMonsterId >= 1 && foundMonsterId <= 50) {
      // Valid monster found
      setIsScanningActive(false); // Stop scanning after a scan attempt
      setShowMessage(false); // Hide the scanning message
      console.log(`SCANNINGSCREEN: Found monster with ID: ${foundMonsterId}`);
      try {
        const fetchedMonsterInfo = await fetchMonsterDetailsFromFirestore(foundMonsterId);
        const fetchedImageURL = await fetchMonsterImageURL(foundMonsterId);

        setMonsterInfo(fetchedMonsterInfo);
        setImageURL(fetchedImageURL);

        openModal();
        // Log for successful scan
     //   console.log(`Bar code with type ${type} and data ${data} has been scanned.`);
      } catch (error) {
        console.error('Error fetching monster details:', error);
      }
    } else {
      // No valid monster found
      setNoMonsterFound(true);
      setShowMessage(true);
      setScanningMessage('No monster found, try a different code.');
      setIsScanningActive(false);
      console.log(`SCANNINGSCREEN: No monster found.`);
    }
    setLastScannedData(data);
    setIsScanningActive(false); // Stop scanning after a scan attempt
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
    setScanned(false);
    setResetScanner(true);
    setNoMonsterFound(false);
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
          onBarCodeScanned={isScanningActive ? handleBarCodeScanned : undefined}
    //   onBarCodeScanned={handleBarCodeScanned}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleTorchToggle} style={styles.torchToggleButton}>
              <Ionicons name={torchOn ? 'ios-flashlight' : 'ios-flashlight-outline'} size={40} color="white" />
            </TouchableOpacity>
          </View>
     {/*     <View style={styles.scannerFrame} /> */}
          <View style={styles.scannerButtonContainer}>
            <TouchableOpacity onPress={initiateScanning} style={styles.barcodeScannerButton}>
              <MaterialCommunityIcons name="barcode-scan" size={60} color="white" />
            </TouchableOpacity>
          </View>
          <Slider
            style={styles.sliderStyle}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="teal"
            thumbTintColor="teal"
            value={sliderValue}
            onValueChange={handleZoomChange}
            vertical={true}
          />
        </Camera>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Placeholder content or empty view */}
        </View>
      )}

{/* ALLA OLEVA NÄYTTÄÄ VIESTIN, JOS SKANNATTU KOODI ON JO SKANNATTU AIEMMIN. VOI TESTEISSÄ KOMMENTOIDA POIS */}
{/* ALLA OLEVA NÄYTTÄÄ VIESTIN, JOS EI TULE MONSTERIA. VOI TESTEISSÄ KOMMENTOIDA POIS */}
{/* --------------------------------------------------------------- */}
{showMessage && (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{scanningMessage}</Text>
        {/*
        <TouchableOpacity onPress={hideMessage} style={styles.hideMessageButton}>
          <Text style={styles.hideMessageText}>OK</Text>
        </TouchableOpacity>
        */}
      </View>
    )}
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
    scannerButtonContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 20,
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
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      padding: 10,
      borderRadius: 0,
      top: '10%',
      left: '0%',
      right: '0%',
      alignItems: 'center',
    },
    messageText: {
      color: 'white',
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
    barcodeScannerButton: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop:10,
    },
    sliderStyle: {
      width: 250, // This controls the length of slider (position moves also)
      position: 'absolute',
      bottom: 40, // Distance from the bottom
      right: -60, // This controls the position of slider (left or right)
      transform: [
        { rotate: '-90deg' },
        { translateX: 150 } // Adjust this value to fine-tune the horizontal position
      ],
    },
  });