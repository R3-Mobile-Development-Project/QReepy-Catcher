import React from 'react';
import { View, Text, Button, StyleSheet, ImageBackground } from 'react-native';

const backgroundImage = require('../assets/doodle-monsters-set_90220-166.jpg');

const HomeScreen = ({ navigation }) => {
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
    </View>
      </ImageBackground>
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
  image: {
    width: 200, // Set the width as per your requirements
    height: 200, // Set the height as per your requirements
  },
});

export default HomeScreen;