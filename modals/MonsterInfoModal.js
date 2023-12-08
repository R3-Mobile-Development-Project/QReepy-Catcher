import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useSound } from '../utils/SoundContext'; // Import useSound hook

const MonsterInfoModal = ({ isModalVisible, selectedMonster, onClose }) => {
  const [closeSound, setCloseSound] = useState();
  const { areSoundsMuted } = useSound(); // Use the useSound hook

  const dominantColors = selectedMonster?.dominantColors;
  const backgroundColor = dominantColors ? `rgb(${dominantColors[0]}, ${dominantColors[1]}, ${dominantColors[2]})` : 'white';

  useEffect(() => {
    return () => {
      if (closeSound) {
        closeSound.unloadAsync();
      }
    };
  }, [closeSound]);

  const playCloseSound = async () => {
    if (!areSoundsMuted) {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/Menu_Selection_Click.wav')
      );
      setCloseSound(sound);
      await sound.playAsync();
    }
  };

  const handleClosePress = () => {
    playCloseSound();
    onClose();
  };
  
 return (
    <Modal
    animationType="fade"
    transparent={true}
    visible={isModalVisible}
    onRequestClose={() => isModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={{ ...styles.modalContent, backgroundColor: backgroundColor }}>
          {selectedMonster && (
            <>
              <Image source={{ uri: selectedMonster.image }} style={styles.image} />
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.rowContainer}>
                  <Text style={styles.monsterName}>{selectedMonster.name}</Text>
                  <Text style={styles.title}>{selectedMonster.title}</Text>
                </View>

                <Text style={styles.rarity}>{selectedMonster.rarity} QReep</Text>
                <Text style={styles.age}>Age: {selectedMonster.age}</Text>
                <Text style={styles.nature}>Nature: {selectedMonster.nature}</Text>
                <Text style={styles.background}>{selectedMonster.background}</Text>
                {/* Add more monster details here */}
              </ScrollView>
            </>
          )}
          <TouchableOpacity onPress={handleClosePress} style={styles.closeButton}>
            <MaterialIcons name="close" size={50} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      
    </Modal>
 );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    height: '85%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    bottom: 0,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderColor: 'black',
    borderWidth: 3,
    backgroundColor: 'salmon',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  closeButtonText: {
    fontSize: 18,
  },
  image: {
    width: 300, // Set the image width to 100% to fit the container
    height: 300,
    marginBottom: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'black',
  },
  textContainer: {
    flex: 1, // Add this line to make the text container take up the remaining space
    alignItems: "center",
  },
  monsterName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  rarity: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  age: {
    fontSize: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  nature: {
    fontSize: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  background: {
    fontSize: 22,
    fontWeight: '400',
    color: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
 // Add more styles here
});

export default MonsterInfoModal;