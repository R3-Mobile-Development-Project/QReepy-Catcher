// MusicPlayer.js
import React, { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

const MusicPlayer = ({ muteBackgroundMusic, muteAllSounds }) => {
    const playAudio = async () => {
        const sound = new Audio.Sound();

        try {
          const source = require('./assets/sounds/happy_adveture.mp3');
          console.log('Source:', source);

          await sound.loadAsync(source, { isLooping: true }); // , { isLooping: false }
          console.log('Music loaded successfully');

          // Set the initial volume (value between 0 and 1)
        await sound.setVolumeAsync(0.2); // Adjust the volume as needed

          await sound.playAsync();
          console.log('Music is playing...');

          // Add other logic or event listeners as needed

          // Optionally, wait for the playback to finish
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
         //     console.log('Playback finished.');
              // Handle playback completion
          //    sound.unloadAsync(); // Unload the audio when playback is complete
            }
          });
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      };

      useEffect(() => {
        playAudio();
      }, []);

};

export default MusicPlayer;
