// MusicContext.js
import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // Flag to check if the component is mounted
  
    const initAudio = async () => {
      const sound = new Audio.Sound();
      soundRef.current = sound;
  
      try {
        const source = require('../assets/sounds/happy_adveture.mp3');
        await sound.loadAsync(source, { isLooping: true });
  
        if (isMounted) {
          playMusic(); // Start playing music after successful loading
        }
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };
  
    if (isMounted) {
      initAudio();
    }
  
    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  

  const playMusic = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsMusicPlaying(true);
    }
  };

  const stopMusic = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsMusicPlaying(false);
    }
  };

  return (
    <MusicContext.Provider value={{ isMusicPlaying, playMusic, stopMusic }}>
      {children}
    </MusicContext.Provider>
  );
};
