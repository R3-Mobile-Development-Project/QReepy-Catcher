import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground,  Switch, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AchievementsModal from '../modals/AchievementsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useMusic } from '../utils/MusicContext';
import { useSound } from '../utils/SoundContext';

const backgroundImage = require('../assets/images/paper-decorations-halloween-pack_23-2148635839.jpg');

const ProfileScreen = () => {
  const [achievementsModalVisible, setAchievementsModalVisible] = useState(false);
  const [isAudioSettingsModalVisible, setAudioSettingsModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const { isMusicMuted, toggleMusic } = useMusic();
  const { areSoundsMuted, toggleSounds, playSound } = useSound();
  const handleAudioSettingsToggle = () => {
    setAudioSettingsModalVisible(!isAudioSettingsModalVisible);
};
  const handleLogout = async () => {
    playSound(require('../assets/sounds/part.wav'));
    // Logout logic
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    playSound(require('../assets/sounds/Menu_Selection_Click.wav'));
  };

  const openAchievementsModal = () => {
    playSound(require('../assets/sounds/Menu_Selection_Click.wav'));
    setAchievementsModalVisible(true);
  };

  const closeAchievementsModal = () => {
    playSound(require('../assets/sounds/Menu_Selection_Click.wav'));
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
  
            {/* Audio Settings Button */}
            <TouchableOpacity onPress={handleAudioSettingsToggle} style={styles.audioSettingsButton}>
            <FontAwesome5  name="music" size={24} color="black" />
              <Text style={styles.audioSettingsButtonText}>Audio Settings</Text>
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
  // Styles for Audio Settings Modal
  audioSettingsButton: {
    marginTop: 10,
    width: 170,
    height: 60,
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
