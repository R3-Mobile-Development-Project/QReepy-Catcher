import React, { createContext, useState, useContext, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const [areSoundsMuted, setAreSoundsMuted] = useState(false);

    // Fetch the sound preference from AsyncStorage
    const fetchSoundPreference = async () => {
        try {
            const value = await AsyncStorage.getItem('areSoundsMuted');
            if (value !== null) {
                setAreSoundsMuted(JSON.parse(value));
            }
        } catch (error) {
            console.error('Error fetching sound preferences:', error);
        }
    };

    useEffect(() => {
        fetchSoundPreference();
    }, []);

    const playSound = async (soundFile) => {
        if (!areSoundsMuted) {
            try {
                const { sound } = await Audio.Sound.createAsync(soundFile);
                await sound.playAsync();
                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        sound.unloadAsync();
                    }
                });
            } catch (error) {
                console.error('Error playing sound:', error);
            }
        }
    };

    const toggleSounds = async () => {
        const newMutedState = !areSoundsMuted;
        setAreSoundsMuted(newMutedState);
        await AsyncStorage.setItem('areSoundsMuted', JSON.stringify(newMutedState));
    };

    return (
        <SoundContext.Provider value={{ areSoundsMuted, toggleSounds, playSound }}>
            {children}
        </SoundContext.Provider>
    );
};
