import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { firebase } from '@react-native-firebase/auth';

const ChPwModal = ({ visible, onClose }) => {
  const [closeSound, setCloseSound] = useState();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async () => {
    try {
      const user = firebase.auth().currentUser;
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // Reauthenticate the user
      await user.reauthenticateWithCredential(credential);

      // Change the password
      await user.updatePassword(newPassword);

      Alert.alert('Success', 'Password changed successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            onChangeText={(text) => setCurrentPassword(text)}
          />

          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            onChangeText={(text) => setNewPassword(text)}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChPwModal; */

 /* useEffect(() => {
    return () => {
      if (closeSound) {
        closeSound.unloadAsync();
      }
    };
  }, [closeSound]);

  const playCloseSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/Menu_Selection_Click.wav')
    );
    setCloseSound(sound);
    await sound.playAsync();
  };

  const handleClosePress = () => {
    playCloseSound();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Credits</Text>
          <View style={styles.modalLine} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.centeredContainer}>
          <Text style={styles.creditText}>This app was created by:</Text>
          <Text style={styles.creditText}>Anssi Kulotie</Text>
          <Text style={styles.creditText}>Hannu Väliahde</Text>
          <Text style={styles.creditText}>Miikka Tyvelä</Text>
          <Text style={styles.creditText}>Niko Kolehmainen</Text>
          <View style={styles.modalLine} />
          <Text style={styles.creditText}>Oulu University of Applied Sciences</Text>
          <Text style={styles.creditText}>TVT22KMO, Mobile Project Group 3</Text>
          <View style={styles.modalLine} />
          <Text style={styles.creditText}>Some of the sounds in this project were created by:</Text>
          <Text style={styles.creditText}>TinyWorlds - OpenGameArt.org</Text>
          <Text style={styles.creditText}>David McKee (ViRiX) soundcloud.com/virix</Text>
          <Text style={styles.creditText}>NenadSimic - OpenGameArt.org</Text>
          <View style={styles.modalLine} />
        </View>
      </ScrollView>
          <TouchableOpacity onPress={handleClosePress} style={styles.closeButton}>
          <MaterialIcons name="close" size={50} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    height: '80%',
    backgroundColor: 'lightblue',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalLine: {
    height: 3,
    width: '100%',
    backgroundColor: 'black',
    marginVertical: 20,
  },
  creditText: {
    fontSize: 16,
    marginBottom: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderColor: 'black',
    borderWidth: 3,
    backgroundColor: 'salmon',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
  },
});

export default CreditsModal; */
