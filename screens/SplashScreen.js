
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';
import { useSound } from '../utils/SoundContext'; // Import useSound hook

const SplashScreen = () => {
  const { areSoundsMuted, isInitialized } = useSound(); // Use new state
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.5);
  const translationX = new Animated.Value(-500);
  const translationY = new Animated.Value(-500);

   // Function to play audio
   async function playAudio() {
    if (!areSoundsMuted) {
      const sound = new Audio.Sound();
      try {
        const source = require('../assets/sounds/MESSAGE-B_Accept_TOIMII.wav');
        await sound.loadAsync(source);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  }

  // useEffect for playing audio
  useEffect(() => {
    if (isInitialized) {
      playAudio();
    }
  }, [isInitialized, areSoundsMuted]);

  // useEffect for animations
  useEffect(() => {
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

    Animated.sequence([
      Animated.delay(600),
      Animated.timing(translationX, {
        toValue: 0,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // Empty dependency array to run once on mount


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