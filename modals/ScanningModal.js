import React, {useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getFirestore, collection, query, onSnapshot, where } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const ScanningModal = ({ isVisible, onClose, openGallery, monsterInfo, imageURL }) => {
  const [sellSound, setSellSound] = useState();
  const [openModalSound, setOpenModalSound] = useState();

  useEffect(() => {
    return () => {
      if (sellSound) {
        sellSound.unloadAsync();
      }
      if (openModalSound) {
        openModalSound.unloadAsync();
      }
    };
  }, [sellSound, openModalSound]);

  const playSellSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/ETRA_TOIMII.wav')
    );
    setSellSound(sound);
    await sound.playAsync();
  };

  const playOpenModalSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/Win-sound.wav') // Replace with your sound file
    );
    setOpenModalSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    if (isVisible) {
      playOpenModalSound();
    }
  }, [isVisible]);

  const handleSellPress = () => {
    playSellSound();
    // Add your logic for handling the "Sell" button press
    console.log('Sell button pressed');
  };

  return (
    <Modal
        animationType="fade"
        isVisible={isVisible}
        onRequestClose={onClose}
        transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>YOU CAUGHT A QREEP!</Text>

        {/* Add a conditional check for imageUrl before using it */}
          {imageURL ? (
            <Image source={{ uri: imageURL }} style={styles.image} />
          ) : null}

          {monsterInfo.map((monster, index) => (
            <View key={index}>
              <Text style={styles.name}>{monster.name}</Text>
              <Text style={styles.title}>{monster.title}</Text>
            </View>
          ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSellPress}>
            <Text style={styles.buttonText}>Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={openGallery}>
            <Text style={styles.buttonText}>View in Gallery</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
      },
      modalText: {
        fontSize: 24,
        fontWeight: 'bold',
      },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: 'teal',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    width: 70,
    height: 70,
    borderRadius: 25,
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

export default ScanningModal;
