import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import CreditsModal from '../modals/CreditsModal';

const backgroundImage = require('../assets/images/doodle-monsters-set_90220-166.jpg');

const HomeScreen = ({ navigation }) => {
  const [creditsModalVisible, setCreditsModalVisible] = useState(false);
  const [sound, setSound] = useState();

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
      require('../assets/sounds/MENU_Pick.wav')
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
      <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="repeat"
    >
      <View style={styles.contentContainer}>
      <Text style={styles.text}>Welcome to the Home Screen!</Text>
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate('Profile')}
      />
      <TouchableOpacity onPress={openCreditsModal} style={styles.creditsButton}>
          <Text style={styles.creditsButtonText}>CREDITS</Text>
      </TouchableOpacity>
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
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignContent: 'center',
  },
  text: {
    fontSize: 24,
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
});

export default HomeScreen;