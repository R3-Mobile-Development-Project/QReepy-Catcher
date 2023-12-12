import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Switch, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AchievementsModal from '../modals/AchievementsModal';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useMusic } from '../utils/MusicContext'; // Import useMusic hook
import { useSound } from '../utils/SoundContext'; // Import useSound hook
import { fetchAchievements } from '../utils/monsterUtils';
import { useFocusEffect } from '@react-navigation/native';

const backgroundImage = require('../assets/images/paper-decorations-halloween-pack_23-2148635839.jpg');

const ProfileScreen = () => {
    const [achievementsModalVisible, setAchievementsModalVisible] = useState(false);
    const [muteBackgroundMusic, setMuteBackgroundMusic] = useState(false);
    const [muteAllSounds, setMuteAllSounds] = useState(false);
    const { isMusicMuted, toggleMusic } = useMusic();
    const [isModalVisible, setModalVisible] = useState(false);
    const [isAudioSettingsModalVisible, setAudioSettingsModalVisible] = useState(false);
    const { areSoundsMuted, toggleSounds, playSound } = useSound();
    const { playMusic, stopMusic } = useMusic(); // Use the useMusic hook
    const [achievements, setAchievements] = useState([]);

    useFocusEffect(
      React.useCallback(() => {
        playButtonSound();
      }, [])
    );

    const handleAudioSettingsToggle = () => {
      playButtonSound(); // Play button sound on audio settings button press
      setAudioSettingsModalVisible(!isAudioSettingsModalVisible);
    };

    useEffect(() => {
      if (achievementsModalVisible) {
      fetchAchievements('firstCatch')
        .then(data => {
          setAchievements(data);
          console.log(data);
        })
        .catch(error => console.error(error));
      }
     }, [achievementsModalVisible]);

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
      try {
        setTimeout(async () => {
      await buttonSound.unloadAsync();
        }, 500);
      }
      catch (error) {
        console.error('Error unloading button sound:', error);
      }
    }

    const playDeleteSound = async () => {
      const buttonSound = new Audio.Sound();

      try {
        const buttonSource = require('../assets/sounds/unlink.wav'); // Replace with your button sound file path
        await buttonSound.loadAsync(buttonSource);
        await buttonSound.playAsync();
      } catch (error) {
        console.error('Error playing button sound:', error);
      } try {
        setTimeout(async () => {
      await buttonSound.unloadAsync();
        }, 500);
      }
      catch (error) {
        console.error('Error unloading button sound:', error);
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
      } try {
        setTimeout(async () => {
      await buttonSound.unloadAsync();
        }, 500);
      }
      catch (error) {
        console.error('Error unloading button sound:', error);
      }
    }

    const toggleModal = () => {
      setModalVisible(!isModalVisible);
      playSound(require('../assets/sounds/Menu_Selection_Click.wav'));
    };

    const openAchievementsModal = () => {
      playButtonSound(); // Play button sound on achievements button press
      setAchievementsModalVisible(true);
    };

    const closeAchievementsModal = () => {
      playButtonSound(); // Play button sound on close button press
      setAchievementsModalVisible(false);
    };

    const handleBackgroundMusicToggle = () => {
      toggleMusic(); // This will invert the current state
    };
  
    const handleAllSoundsToggle = () => {
      toggleSounds();
    };

    // Function to clear monsters from AsyncStorage for a specific user
    const clearMonstersForUser = async () => {
      toggleModal(); // Show the confirmation modal
    };

    const deleteMonstersConfirmed = async () => {
      try {
      const userId = await AsyncStorage.getItem('userId');
      await AsyncStorage.removeItem(`monsters_${userId}`);
      //Remove barcodes from AsyncStorage
      await AsyncStorage.removeItem(`lastScannedBarcodes`);
      //Remove eggs from AsyncStorage
      await AsyncStorage.removeItem(`boughtEggs_${userId}`);
      //Remove selected egg index from AsyncStorage
      await AsyncStorage.removeItem(`selectedEggIndex_${userId}`);
      //Remove isTrackingEgg from AsyncStorage
      await AsyncStorage.removeItem(`isTrackingEgg_${userId}`);
      //Remove caught monsters from AsyncStorage
      await AsyncStorage.removeItem(`caughtMonsters_${userId}`);
      //Remove caught monsters from AsyncStorage
      await AsyncStorage.removeItem(`achievedMonsterIds_${userId}`);
      // Remove achievements from AsyncStorage
      await AsyncStorage.removeItem(`userProgress_${userId}`);

    //  await AsyncStorage.removeItem(`images_${userId}`);
      playDeleteSound(); // Play delete sound on delete button press
      console.log(`Collection for user ${userId} cleared successfully!`);
      toggleModal(); // Close the modal after deletion
      Alert.alert('Collection has been deleted! Please relog for all changes.');
      } catch (error) {
        console.error('Error deleting monsters:', error);
      }
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

            {/* Achievements Button */}
            <TouchableOpacity onPress={openAchievementsModal} style={styles.achievementsButton}>
              <FontAwesome5  name="trophy" size={24} color="black" />
              <Text style={styles.achievementsButtonText}>ACHIEVEMENTS</Text>
            </TouchableOpacity>

            {/* Audio Settings Button */}
            <TouchableOpacity onPress={handleAudioSettingsToggle} style={styles.audioSettingsButton}>
            <FontAwesome5  name="music" size={24} color="black" />
              <Text style={styles.audioSettingsButtonText}>AUDIO SETTINGS</Text>
            </TouchableOpacity>

            {/* Audio Settings Modal */}
            <Modal
              visible={isAudioSettingsModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={handleAudioSettingsToggle}
            >
            <View style={styles.audioModalView}>
            <Text style={styles.audioModalText}>Audio Settings</Text>

          {/* Background Music Switch */}
          <View style={styles.audioSwitchContainer}>
          <Text style={styles.audioSwitchLabel}>Mute Background Music</Text>
          <Switch
            value={isMusicMuted}
            onValueChange={toggleMusic}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isMusicMuted ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        {/* All Sounds Switch */}
        <View style={styles.audioSwitchContainer}>
          <Text style={styles.audioSwitchLabel}>Mute All Sounds</Text>
          <Switch
            value={areSoundsMuted}
            onValueChange={toggleSounds}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={areSoundsMuted ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity onPress={handleAudioSettingsToggle} style={styles.audioCloseButton}>
          <Text style={styles.audioCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>

            {/* Delete Collection Button */}
            <TouchableOpacity onPress={clearMonstersForUser} style={styles.clearButton}>
              <MaterialCommunityIcons name="trash-can" size={24} color="black" />
              <Text style={styles.clearButtonText}>DELETE COLLECTION</Text>
            </TouchableOpacity>
          {/* Confirmation Modal */}
          <Modal
            isVisible={isModalVisible}
            onBackButtonPress={toggleModal}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Are you sure you want to delete your Collection?</Text>
              <Text style={styles.modalText}>This cannot be undone.</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={toggleModal} style={styles.modalCancelButton}>
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteMonstersConfirmed} style={styles.modalDeleteButton}>
                  <Text style={styles.modalDeleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="black" />
              <Text style={styles.buttonText}>SIGN OUT</Text>
          </TouchableOpacity>


          </View>
        </ImageBackground>
        <AchievementsModal
          visible={achievementsModalVisible}
          onClose={closeAchievementsModal}
          achievements={achievements}
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
    backgroundColor: 'rgba(255,255,255,0.5)', // Semi-transparent white
    borderRadius: 20, // Adjust this value as needed
    // Add padding if needed
    padding: 5, // Optional, adjust as needed
},
  switchLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  button: {
    width: 200,
    height: 70,
 //   flexDirection: 'row',
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderColor: 'black',
    borderWidth: 3,
  },
  buttonText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
  //  marginRight: 10,
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
  //  flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
    width: 200,
    height: 70,
    backgroundColor: 'lightyellow',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 3,
  },
  achievementsButtonText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
 //   marginRight: 10,
    fontSize: 18,
  },
  // Clear AsyncStorage Button Styles
  clearButton: {
 //   flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
    width: 200,
    height: 70,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 3,
  },
  clearButtonText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
 //   marginRight: 10,
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'lightgrey',
    padding: 20,
    borderRadius: 10,
    borderColor: 'red',
    borderWidth: 5,
  },
  modalText: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  modalCancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalDeleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  modalDeleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Styles for Audio Settings Modal
  audioSettingsButton: {
    marginTop: 10,
    width: 200,
    height: 70,
    backgroundColor: 'lightgreen',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 3,
  },
  audioSettingsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioModalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioModalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  audioSwitchLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  audioCloseButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  audioCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProfileScreen;
