import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from Expo vector icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import ScanningModal from '../modals/ScanningModal';
import AdModal from '../modals/AdModal';
import adImage1 from '../assets/images/adpicture1.png';
import adImage2 from '../assets/images/adpicture2.png';
import { useSound } from '../utils/SoundContext'; // Import useSound hook
import { findMonster, fetchMonsterDetailsFromFirestore, fetchMonsterImageURL} from '../utils/monsterUtils';
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
  const scanningTimeoutRef = useRef(null); // Reference to store the scanning timeout
  const { areSoundsMuted } = useSound(); // Use the useSound hook
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0); // New state to track current ad
  const ads = [
    { image: adImage1, url: 'https://dictionary.cambridge.org/dictionary/english/patience' },
    { image: adImage2, url: 'https://www.vr.fi/' },
  ]
  // Function to load the last 10 scanned barcodes from AsyncStorage
const loadScannedBarcodes = async () => {
  try {
    const storedBarcodes = await AsyncStorage.getItem('lastScannedBarcodes');
    if (storedBarcodes) {
      setScannedBarcodes(JSON.parse(storedBarcodes));
    }
    return storedBarcodes;
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
    const slicedBarcodes = scannedBarcodes.slice(-1); //VAIHDA MÄÄRÄÄ, JOS HALUAT ENEMMÄN TAI VÄHEMMÄN TALLENNETTAVIA KOODEJA
    await AsyncStorage.setItem('lastScannedBarcodes', JSON.stringify(slicedBarcodes));
    const savedBarcodes = await AsyncStorage.getItem('lastScannedBarcodes');
    console.log('SCANNINGSCREEN: Scanned barcodes saved to AsyncStorage:', savedBarcodes);
  } catch (error) {
    console.error('Error saving scanned barcodes to AsyncStorage:', error);
  }
};

const initiateScanning = () => {
  if (Math.random() < 0.2) {
    setAdModalVisible(true);
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length); // Alternate between ads
    setTimeout(() => {
      setAdModalVisible(false);
    }, 3000);
    return;
    }
    setLastScannedData(null);
    setIsScanningActive(true);
    setIsDebouncingScan(false); // Reset debounce state
    setScanningMessage('SCANNING FOR QREEPS...');
    setShowMessage(true); // Show scanning message
    // Clear any existing timeout
  clearTimeout(scanningTimeoutRef.current);

  // Set a new timeout
  scanningTimeoutRef.current = setTimeout(() => {
    setIsScanningActive(false);
    setScanningMessage('Scanning timed out. Please try again.');
    setShowMessage(true);
  }, 30000); // 30 seconds timeout
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
    if (!areSoundsMuted) {
      const torchSound = new Audio.Sound();
      try {
        const torchSource = require('../assets/sounds/wall.wav');
        await torchSound.loadAsync(torchSource);
        await torchSound.playAsync();
      } catch (error) {
        console.error('Error playing torch sound:', error);
      }
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
    // Clear the timeout as soon as a barcode is scanned
    clearTimeout(scanningTimeoutRef.current);
    // Ignore scans if not scanning or if debouncing or if barcode already scanned
  if (!isScanningActive || isDebouncingScan || scannedBarcodes.includes(data)){

  setScanningMessage('Code already scanned, try scanning another.');
  setIsScanningActive(false);
  setShowMessage(true);
//  console.log('SCANNINGSCREEN: Scanned barcodes:', scannedBarcodes);
  return;
  }

  console.log('SCANNINGSCREEN: Scanned barcode:', data, 'of type:', type);

  // Update the list of scanned barcodes
  setScannedBarcodes((prevScannedBarcodes) => [...prevScannedBarcodes, data]);

  // Save the last 10 scanned barcodes to AsyncStorage
  saveScannedBarcodes();

    setIsDebouncingScan(true); // Start debounce cooldown
    // Set a timeout to clear the debounce state after a short period
    setTimeout(() => setIsDebouncingScan(false), 2000); // Adjust the cooldown time as needed

    const foundMonsterId = findMonster(); // Assuming this function processes 'data' to find a monster

    if (foundMonsterId >= 1 && foundMonsterId <= 50) {
      // Valid monster found
      setIsScanningActive(false); // Stop scanning after a scan attempt
      setShowMessage(false); // Hide the scanning message
      console.log(`SCANNINGSCREEN: Found monster with ID: ${foundMonsterId}`);
      
      const userId = await AsyncStorage.getItem('userId');
      const existingMonsters = await AsyncStorage.getItem(`caughtMonsters_${userId}`);
      let parsedExistingMonsters = [];

      // Check if existingMonsters is not null or undefined
      if (existingMonsters) {
      // If it's not null or undefined, parse it
      parsedExistingMonsters = JSON.parse(existingMonsters);
      }

      parsedExistingMonsters.push(foundMonsterId);

      const arrayMax = 5; // VAIHDA TÄMÄN ARVO VÄHINTÄÄN SAMAAN KUIN MITÄ EGGMODALIN neededMonsters
      // Keep only the last monsters caught up to the arrayMax value
      if (parsedExistingMonsters.length > arrayMax) {
        parsedExistingMonsters = parsedExistingMonsters.slice(-arrayMax);
      }

      // Store the updated array in AsyncStorage
      await AsyncStorage.setItem(`caughtMonsters_${userId}`, JSON.stringify(parsedExistingMonsters));
      const storedMonsterIdsString = await AsyncStorage.getItem(`caughtMonsters_${userId}`);
      console.log(`SCANNINGSCREEN: ${storedMonsterIdsString} monsters caught for user ID: ${userId}`);


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

       // Create a monster object with the necessary properties
       //Alert.alert('Test Alert', 'This is a test alert');
    /*const monster = {
      id: foundMonsterId,
      // other properties...
    };
    
    // Pass the monster object to saveMonsterToAsyncStorage
    const newAchievements = await saveMonsterToAsyncStorage(monster, userId);

    if (newAchievements.length > 0) {
      // If there are new achievements, display an alert using React Native Alert
      const achievementMessage = `New Achievements: ${newAchievements.join(', ')}`;
      Alert.alert('Achievement Unlocked', achievementMessage);
    }*/

    } else {
      // No valid monster found
      setNoMonsterFound(true);
      setShowMessage(true);
      setScanningMessage('No QReep found, try a different code.');
      setIsScanningActive(false);
      console.log(`SCANNINGSCREEN: No monster found.`);
    }
    setLastScannedData(data);
    setIsScanningActive(false); // Stop scanning after a scan attempt

    // Clear any existing timeout
    if (scanningTimeoutRef.current) {
      clearTimeout(scanningTimeoutRef.current);
    }
  
    // Reset the scanner timeout
    scanningTimeoutRef.current = setTimeout(() => {
      if (isScanningActive) {
        setIsScanningActive(false);
        setScanningMessage('Scanning timed out. Please try again.');
        setShowMessage(true);
      }
    }, 3000); // 30 seconds timeout
  };

  const playButtonSound = async () => {
    if (!areSoundsMuted) {
      const buttonSound = new Audio.Sound();
      try {
        const buttonSource = require('../assets/sounds/Menu_Selection_Click.wav');
        await buttonSound.loadAsync(buttonSource);
        await buttonSound.playAsync();
      } catch (error) {
        console.error('Error playing button sound:', error);
      }
    }
  };

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
          autoFocus={Camera.Constants.AutoFocus.on} // Enable autofocus
          onBarCodeScanned={isScanningActive ? handleBarCodeScanned : undefined}
          onCameraReady={() => {}}
          onMountError={(error) => console.log('Camera mount error:', error)}
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
{/* Ad Modal */}
{adModalVisible && (
        <AdModal
          isVisible={adModalVisible}
          adContent={ads[currentAdIndex]} // Pass the current ad content
          onClose={() => setAdModalVisible(false)}
        />
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
      paddingBottom: 40,
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
      bottom: 25, // Distance from the bottom
      right: -60, // This controls the position of slider (left or right)
      transform: [
        { rotate: '-90deg' },
        { translateX: 150 } // Adjust this value to fine-tune the horizontal position
      ],
    },
  });