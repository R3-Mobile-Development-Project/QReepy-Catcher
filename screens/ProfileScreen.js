import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Switch, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { MaterialIcons,FontAwesome5 } from '@expo/vector-icons';
import AchievementsModal from '../modals/AchievementsModal';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { fetchAchievements } from '../utils/monsterUtils';
import { useMusic } from '../utils/MusicContext'; // Import useMusic hook

const backgroundImage = require('../assets/images/paper-decorations-halloween-pack_23-2148635839.jpg');

const ProfileScreen = () => {
    const [achievementsModalVisible, setAchievementsModalVisible] = useState(false);
    const [muteBackgroundMusic, setMuteBackgroundMusic] = useState(false);
    const [muteAllSounds, setMuteAllSounds] = useState(false);
    const [isMusicMuted, setIsMusicMuted] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const { playMusic, stopMusic } = useMusic(); // Use the useMusic hook
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
      fetchAchievements(setAchievements);
      
     }, []);

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

    const toggleModal = () => {
      setModalVisible(!isModalVisible);
      playButtonSound(); // Play button sound on delete button press
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

    const openAchievementsModal = () => {
      playButtonSound(); // Play button sound on achievements button press
      setAchievementsModalVisible(true);
    };

    const closeAchievementsModal = () => {
      playButtonSound(); // Play button sound on close button press
      setAchievementsModalVisible(false);
    };

    const handleBackgroundMusicToggle = () => {
      setMuteBackgroundMusic(prevState => {
        const newState = !prevState;
        if (newState) {
          stopMusic();
        } else {
          playMusic();
        }
        return newState;
      });
    };

    const handleAllSoundsToggle = () => {
      setMuteAllSounds((prev) => !prev);
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

    //  await AsyncStorage.removeItem(`images_${userId}`);
      playDeleteSound(); // Play delete sound on delete button press
      console.log(`Collection for user ${userId} cleared successfully!`);
      toggleModal(); // Close the modal after deletion
      Alert.alert('Collection has been deleted! Please relog for all changes to take effect.');
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


{/* Mute Background Music Switch */}
<View style={styles.switchContainer}>
  <Text style={styles.switchLabel}>Mute Background Music</Text>
  {muteBackgroundMusic ? (
    <FontAwesome5 name="volume-mute" size={24} color="black" />
  ) : (
    <FontAwesome5 name="volume-up" size={24} color="black" />
  )}
  <Switch
    value={muteBackgroundMusic}
    onValueChange={handleBackgroundMusicToggle}
    trackColor={{ false: '#767577', true: '#81b0ff' }}
    thumbColor={muteBackgroundMusic ? '#f5dd4b' : '#f4f3f4'}
    ios_backgroundColor="#3e3e3e"
  />
</View>



            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>SIGN OUT</Text>
              <MaterialIcons name="logout" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openAchievementsModal} style={styles.achievementsButton}>
            <FontAwesome5  name="trophy" size={24} color="black" />

              <Text style={styles.achievementsButtonText}>ACHIEVEMENTS</Text>
            </TouchableOpacity>

            {/* Clear AsyncStorage Button */}
          <TouchableOpacity onPress={clearMonstersForUser} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>DELETE YOUR COLLECTION</Text>

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
    color: 'black',
    fontWeight: 'bold',
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
  // Clear AsyncStorage Button Styles
  clearButton: {
    marginTop: 10,
    width: 200,
    height: 60,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 3,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default ProfileScreen;
