import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Switch } from 'react-native';
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase authentication methods
import { MaterialIcons } from '@expo/vector-icons';
import AchievementsModal from '../modals/AchievementsModal';
import { Audio } from 'expo-av';
import MusicPlayer from '../MusicPlayer';

const backgroundImage = require('../assets/images/paper-decorations-halloween-pack_23-2148635839.jpg');

  const ProfileScreen = () => {
    const [achievementsModalVisible, setAchievementsModalVisible] = useState(false);
    const [muteBackgroundMusic, setMuteBackgroundMusic] = useState(false);
    const [muteAllSounds, setMuteAllSounds] = useState(false);
    const [isMusicMuted, setIsMusicMuted] = useState(false);

    const handleLogout = async () => {
      playSignoutSound(); // Play button sound on logout button press
      const auth = getAuth();

      try {
        await signOut(auth);
        // After successful logout, you can navigate the user back to the login screen
    //    navigation.navigate('Login');
        console.log("User logged out");
        // You should also update the userLoggedIn state in your App.js
      } catch (error) {
        // Handle any potential errors during logout
        console.error('Logout error:', error);
      }
    };

    const playButtonSound = async () => {
      const buttonSound = new Audio.Sound();

      try {
        const buttonSource = require('../assets/sounds/Menu_Selection_Click.wav'); // Replace with your button sound file path
        await buttonSound.loadAsync(buttonSource);
        await buttonSound.playAsync();
      } catch (error) {
        console.error('Error playing button sound:', error);
      }
    }

    const playSignoutSound = async () => {
      const buttonSound = new Audio.Sound();

      try {
        const buttonSource = require('../assets/sounds/part.wav'); // Replace with your button sound file path
        await buttonSound.loadAsync(buttonSource);
        await buttonSound.playAsync();
      } catch (error) {
        console.error('Error playing button sound:', error);
      }
    }

    const openAchievementsModal = () => {
      playButtonSound(); // Play button sound on achievements button press
      setAchievementsModalVisible(true);
    };

    const closeAchievementsModal = () => {
      playButtonSound(); // Play button sound on close button press
      setAchievementsModalVisible(false);
    };

    const handleBackgroundMusicToggle = () => {
      setMuteBackgroundMusic((prev) => !prev);
    };
  
    const handleAllSoundsToggle = () => {
      setMuteAllSounds((prev) => !prev);
    };

    return (
      <View style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="stretch"
        >
          <View style={styles.contentContainer}>
            <Text style={styles.text}>Welcome to your profile!</Text>


      {/* Mute Background Music Switch */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Mute Background Music</Text>
        <Switch
          value={muteBackgroundMusic}
          onValueChange={handleBackgroundMusicToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={muteBackgroundMusic ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
      </View>

      {/*
      <MusicPlayer
        muteBackgroundMusic={muteBackgroundMusic}
        isMuted={isMusicMuted}
      />
      */}

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>SIGN OUT</Text>
              <MaterialIcons name="logout" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openAchievementsModal} style={styles.achievementsButton}>
              <Text style={styles.achievementsButtonText}>ACHIEVEMENTS</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <AchievementsModal
          visible={achievementsModalVisible}
          onClose={closeAchievementsModal}
        />
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
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  switchLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: 'red',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderColor: 'black',
    borderWidth: 3,
  },
  buttonText: {
    color: 'white',
    marginRight: 10,
    fontSize: 18,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignContent: 'center',
  },
  achievementsButton: {
    marginTop: 10,
    width: 170,
    height: 60,
    backgroundColor: 'lightyellow',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 3,
  },
  achievementsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;