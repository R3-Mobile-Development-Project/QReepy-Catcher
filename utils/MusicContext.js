// MusicContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MusicContext = createContext();

let soundInstance = null;

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

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

  const playMusic = async () => {
    if (isSoundLoaded) {
      await soundInstance.playAsync();
    }
  };

  const stopMusic = async () => {
    if (isSoundLoaded) {
      await soundInstance.pauseAsync();
    }
  };

  const toggleMusic = async () => {
    const newMutedState = !isMusicMuted;
    setIsMusicMuted(newMutedState);
    await AsyncStorage.setItem('isMusicMuted', JSON.stringify(newMutedState));
    
    if (newMutedState) {
      await stopMusic();
    } else {
      await playMusic();
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
    if (isMusicMuted) {
      stopMusic();
    } else {
      playMusic();
    }
  }, [isMusicMuted, isSoundLoaded]);

  return (
    <MusicContext.Provider value={{ isMusicMuted, toggleMusic }}>
      {children}
    </MusicContext.Provider>
  );
};
