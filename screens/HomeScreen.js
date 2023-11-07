import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import CreditsModal from './CreditsScreen';

const backgroundImage = require('../assets/doodle-monsters-set_90220-166.jpg');

const HomeScreen = ({ navigation }) => {
  const [creditsModalVisible, setCreditsModalVisible] = useState(false);

  const openCreditsModal = () => {
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
          <Text style={styles.creditsButtonText}>Credits</Text>
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
    backgroundColor: 'rgba(255,255,255,0.8)',
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
    width: 100,
    height: 40,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  creditsButtonText: {
    fontSize: 18,
  },
  image: {
    width: 200, // Set the width as per your requirements
    height: 200, // Set the height as per your requirements
  },
});

export default HomeScreen;