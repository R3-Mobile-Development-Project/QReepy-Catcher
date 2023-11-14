
// TÄMÄ SIVU KÄYNNISTYY ENSIMMÄISENÄ, KUN SOVELLUS AVATAAN

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ImageBackground, Button } from 'react-native';
import { useFonts } from '@expo-google-fonts/inter';
import { Audio } from 'expo-av';

const SplashScreen = () => {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.5);
  const translationX = new Animated.Value(-500);
  const translationY = new Animated.Value(-500);

  async function playAudio() {
    const sound = new Audio.Sound();
  
    try {
      const source = require('../assets/sounds/MESSAGE-B_Accept_TOIMII.wav');
      await sound.loadAsync(source);
      await sound.playAsync();
      // Add other logic or event listeners as needed

      // Optionally, wait for the playback to finish
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          // Handle playback completion
          sound.unloadAsync(); // Unload the audio when playback is complete
        }
      });

    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  useEffect(() => {
    playAudio();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 2,
        useNativeDriver: true,
      }),
      Animated.timing(translationY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Add a delay of 1000ms (1 second) for the "Catcher" text animation
    Animated.sequence([
      Animated.delay(600), // Wait for 1 second
      Animated.timing(translationX, {
        toValue: 0,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/images/illustration-evil-qr-code-mascot-character_152558-82212.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <Animated.View
        style={[
          styles.animationContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.text,
            { transform: [{ translateY: translationY }] },
          ]}
        >
          QReepy
        </Animated.Text>
        <Animated.Text
          style={[
            styles.text,
            { transform: [{ translateX: translationX }] },
          ]}
        >
          Catcher
        </Animated.Text>
      </Animated.View>
      <View style={styles.createdByTextContainer}>
      <Text style={styles.createdByText}>Created by Ryhmä 3</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    paddingTop: 50,
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 36,
    color: 'black',
  },
  createdByText: {
    fontSize: 18, // Adjust the font size as needed
    color: 'black', // Adjust the color as needed
    marginTop: 20, // Adjust the margin as needed
  },
  createdByTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default SplashScreen;