import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import CreditsModal from '../modals/CreditsModal';
import { useFocusEffect } from '@react-navigation/native';

const backgroundImage = require('../assets/images/doodle-monsters-set_90220-166.jpg');

const HomeScreen = ({ navigation }) => {
  const [creditsModalVisible, setCreditsModalVisible] = useState(false);
  const [sound, setSound] = useState();
  const [userCoins, setUserCoins] = useState(0);

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
      fetchUserData();
    }, [])
  );

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const openCreditsModal = async () => {
    // Load and play the sound effect
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/Menu_Selection_Click.wav')
    );
    setSound(sound);
    await sound.playAsync();

    // Open the credits modal
    setCreditsModalVisible(true);
  };

  const closeCreditsModal = () => {
    setCreditsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>This game is a work in progress!</Text>
      <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="repeat"
    >
      <View style={styles.contentContainer}>
      <Text style={styles.text}>Welcome to QReepy Catcher!</Text>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Use the SCANNER to catch some QReeps by scanning QR and barcodes.</Text>
        <Text style={styles.text}>You can check out all caught QReeps in your COLLECTION.</Text>
        <Text style={styles.text}></Text>
        <Text style={styles.text}>More coming soon!</Text>
      </View>
      {/*}
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate('Profile')}
      />
      */}
      <TouchableOpacity onPress={openCreditsModal} style={styles.creditsButton}>
          <Text style={styles.creditsButtonText}>CREDITS</Text>
      </TouchableOpacity>
      <View style={styles.coinContainer}>
        <MaterialIcons name="toll" size={64} color="purple" />
        <Text style={styles.coinText}>{userCoins}</Text>
      </View>
      </View>
      </ImageBackground>
      <CreditsModal visible={creditsModalVisible} onClose={closeCreditsModal} />
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
    padding: 10,
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
    marginTop: 10,
    width: 120,
    height: 60,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 3,
  },
  creditsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 200, // Set the width as per your requirements
    height: 200, // Set the height as per your requirements
  },
  coinContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinText: {
    fontSize: 34,
    fontWeight: 'bold',
    marginLeft: 5,
    marginRight: 10,
    color: 'purple',
  },
});

export default HomeScreen;