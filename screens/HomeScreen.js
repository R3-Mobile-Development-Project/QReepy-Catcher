import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import CreditsModal from '../modals/CreditsModal';
import StoreModal from '../modals/StoreModal';
import { useFocusEffect } from '@react-navigation/native';
import { useSound } from '../utils/SoundContext'; // Import useSound hook

const backgroundImage = require('../assets/images/doodle-monsters-set_90220-166.jpg');

const HomeScreen = ({ navigation }) => {
  const [creditsModalVisible, setCreditsModalVisible] = useState(false);
  const [sound, setSound] = useState();
  const [userCoins, setUserCoins] = useState(0);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const { areSoundsMuted } = useSound(); // Use the useSound hook

    const fetchUserData = async () => {
      try {
        // Fetch userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        // Fetch user's coin quantity using the userId (replace with your actual logic)
        const coinQuantity = await fetchCoinQuantity(userId);
        // Set the userCoins state with the fetched coin quantity
        setUserCoins(coinQuantity);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

  const fetchCoinQuantity = async (userId) => {
    // fetch coins from async storage using the userId
    const coins = await AsyncStorage.getItem(`coins_${userId}`);
    // If coins exist, return the quantity as a number
    if (coins) {
      return parseInt(coins);
    }
    // If coins do not exist, return 0
    return 0;
  };

  // Use useFocusEffect to refresh monsters when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      playButtonSound();
      fetchUserData();
    }, [])
  );

  const playButtonSound = async () => {
    if (!areSoundsMuted) {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/Menu_Selection_Click.wav')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      return sound;
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const openCreditsModal = async () => {
    const sound = await playButtonSound();
    setSound(sound);
    setCreditsModalVisible(true);
  };

  const closeCreditsModal = () => {
    setCreditsModalVisible(false);
  };

  
  const openStoreModal = async () => {
    const sound = await playButtonSound();
    setSound(sound);
    setStoreModalVisible(true);
  };

  const closeStoreModal = () => {
    setStoreModalVisible(false);
    fetchUserData();
  };

  return (
    <View style={styles.container}>
    {/*  <Text style={styles.text}>This game is a work in progress!</Text>  */}
      <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="repeat"
    >
      <View style={styles.contentContainer}>
      <View style={styles.textContainer}>

      <Text style={styles.text}>Welcome to QReepy Catcher!</Text>
        <Text style={styles.text}></Text>

        <Text style={styles.text}>Use the SCANNER to catch some QReeps by scanning QR and barcodes.</Text>
        <Text style={styles.text}>You can check out all caught QReeps in your COLLECTION.</Text>
        <Text style={styles.text}></Text>
        <Text style={styles.text}>More coming soon!</Text>
      </View>

      <TouchableOpacity onPress={openCreditsModal} style={styles.creditsButton}>
        <MaterialIcons name="groups" size={24} color="black" />
        <Text style={styles.creditsButtonText}>CREDITS</Text>
      </TouchableOpacity>
      <View style={styles.coinContainer}>
        <Image source={require('../assets/images/coin4.png')} style={styles.image} />
        <Text style={styles.coinText}>{userCoins}</Text>
      </View>
      <TouchableOpacity onPress={openStoreModal} style={styles.storeButton}>
        <MaterialIcons name="store" size={100} color="purple" />
        <Text style={styles.storeButtonText}>STORE</Text>
      </TouchableOpacity>
      </View>
      </ImageBackground>
      <CreditsModal visible={creditsModalVisible} onClose={closeCreditsModal} />
      <StoreModal visible={storeModalVisible} onClose={closeStoreModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  textContainer: {
    margin: 10,
    paddingTop: 170,
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignContent: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  creditsButton: {
 //   flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
    width: 200,
    height: 70,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 3,
  },
  creditsButtonText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
 //   marginRight: 10,
    fontSize: 18,
  },
  image: {
    width: 100, // Set the width as per your requirements
    height: 100, // Set the height as per your requirements
    borderRadius: 70, // Set the borderRadius as per your requirements
    borderWidth: 3,
    borderColor: 'purple',
  },
  coinContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    alignItems: 'center',
  },
  coinText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 5,
    marginRight: 10,
    color: 'purple',
  },
  storeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    alignItems: 'center',
  },
  storeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'purple',
  //  alignSelf: 'center',
  },
});

export default HomeScreen;
