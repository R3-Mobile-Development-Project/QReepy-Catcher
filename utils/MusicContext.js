// MusicContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MusicContext = createContext();

let soundInstance = null;

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);

  const initAudio = async () => {
    if (!soundInstance) {
      soundInstance = new Audio.Sound();
      try {
        const source = require('../assets/sounds/happy_adveture.mp3');
        await soundInstance.loadAsync(source, { isLooping: true });
        setIsSoundLoaded(true);
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    }
  };

  const controlMusic = async () => {
    if (isSoundLoaded) {
      if (isMusicMuted) {
        await soundInstance.pauseAsync();
      } else {
        await soundInstance.playAsync();
      }
    }
  };

  const toggleMusic = async () => {
    const newMutedState = !isMusicMuted;
    setIsMusicMuted(newMutedState); // Toggle the muted state
    await AsyncStorage.setItem('isMusicMuted', JSON.stringify(newMutedState));
  
    // Wait for the state to be set, then control music based on new state
    if (newMutedState) {
      stopMusic(); // Muted, so stop music
    } else {
      playMusic(); // Unmuted, so play music
    }
  };

  const fetchMusicMuteState = async () => {
    try {
      const value = await AsyncStorage.getItem('isMusicMuted');
      if (value !== null) {
        setIsMusicMuted(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error fetching music mute state:', error);
    }
  };

  useEffect(() => {
    initAudio();
  }, []);

  useEffect(() => {
    fetchMusicMuteState();
  }, []);

  useEffect(() => {
    controlMusic();
  }, [isMusicMuted, isSoundLoaded]);

  return (
    <MusicContext.Provider value={{ isMusicMuted, toggleMusic }}>
      {children}
    </MusicContext.Provider>
  );
};
