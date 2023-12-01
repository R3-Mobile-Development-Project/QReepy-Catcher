import React, { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const MusicPlayer = ({ muteBackgroundMusic, muteAllSounds, isMuted }) => {
  const soundRef = useRef(null);

  useEffect(() => {
    const playAudio = async () => {
      const sound = new Audio.Sound();
      soundRef.current = sound;

      try {
        const source = require('./assets/sounds/happy_adveture.mp3');
        await sound.loadAsync(source, { isLooping: true });
        await sound.setVolumeAsync(isMuted ? 0 : 0.2);
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            // Handle playback completion
            // sound.unloadAsync();
          }
        });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    };

    playAudio();

    return () => {
      // Clean up resources when the component is unmounted
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [isMuted, muteBackgroundMusic, muteAllSounds]);

  return null; // MusicPlayer doesn't need to render anything
};

export default MusicPlayer;
