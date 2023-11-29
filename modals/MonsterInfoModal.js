import { Modal, View, Text, StyleSheet, Button, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useState, useEffect } from 'react';

const MonsterInfoModal = ({ isModalVisible, selectedMonster, onClose }) => {

  const [closeSound, setCloseSound] = useState();
  //const monsterColor = selectedMonster?.[0]?.dominantColors'
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
  visible={isModalVisible}
  onRequestClose={() => isModalVisible(false)}
>
<View style={{...styles.modalView, backgroundColor: backgroundColor}}>
    {selectedMonster && (
      <>
        <Image source={{ uri: selectedMonster.image }} style={styles.image} />
        <Text style={styles.monsterName}>{selectedMonster.name}</Text>
       <Text style={styles.rarity}>Rarity: {selectedMonster.rarity}</Text>
       <Text style={styles.age}>Age: {selectedMonster.age}</Text>
       <Text style={styles.title}>Title: {selectedMonster.title}</Text>
       <Text style={styles.nature}>Nature: {selectedMonster.nature}</Text>
       <Text style={styles.background}>Background: {selectedMonster.background}</Text>
        {/* Include other details of selectedMonster here */}
        {/* ... */}
      </>
    )}
    <TouchableOpacity onPress={handleClosePress} style={styles.closeButton}>
          <MaterialIcons name="close" size={50} color="black" />
          </TouchableOpacity>
  </View>
  
</Modal>
 );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    //backgroundColor: transparent,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  image: {
    width: 120, // Set the image width to 100% to fit the container
    height: 120,
    marginBottom: 20,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'black',

  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
  },
  monsterName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
    
  },
  rarity: {
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
    
  },
  age: {
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  nature: {
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  background: {
    fontSize: 14,
    color: 'black',
    marginBottom: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
 // Add more styles here
});

export default MonsterInfoModal;