import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useSound } from '../utils/SoundContext'; // Import useSound hook
import AsyncStorage from '@react-native-async-storage/async-storage';

const MonsterInfoModal = ({ isModalVisible, selectedMonster, onClose, onSell }) => {

  const [closeSound, setCloseSound] = useState();
  const [sellSound, setSellSound] = useState();
  const { areSoundsMuted } = useSound(); // Use the useSound hook
  //const monsterColor = selectedMonster?.[0]?.dominantColors'
  const dominantColors = selectedMonster?.dominantColors;
  const backgroundColor = dominantColors ? `rgb(${dominantColors[0]}, ${dominantColors[1]}, ${dominantColors[2]})` : 'white';

  const handleSellPress = async () => {
    playSellSound();
    try {
      // Retrieve the userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      console.log('User ID:', userId);
  
      // Retrieve the monsters array from AsyncStorage
      const monsters = await AsyncStorage.getItem(`monsters_${userId}`);
      const monstersArray = monsters ? JSON.parse(monsters) : [];
  
      // Find the index of the selected monster in the array
      const index = monstersArray.findIndex((monster) => monster.id === selectedMonster.id);
  
      if (index !== -1) {
        // Remove the selected monster from the array
        monstersArray.splice(index, 1);
  
        // Update AsyncStorage with the modified array
        await AsyncStorage.setItem(`monsters_${userId}`, JSON.stringify(monstersArray));
        console.log('Monster sold:', selectedMonster.name, 'for user ID:', userId);

      // Update coin quantity in AsyncStorage
      const coinQuantity = await AsyncStorage.getItem(`coins_${userId}`);
      const currentCoins = coinQuantity ? JSON.parse(coinQuantity) : 0;
      const newCoins = currentCoins + 1;
      await AsyncStorage.setItem(`coins_${userId}`, JSON.stringify(newCoins));
      console.log('Coins updated to:', newCoins, 'for user ID:', userId);
      }
    } catch (error) {
      console.error('Error selling monster:', error);
    }
  
    // Close the modal or perform other actions as needed
    onSell(onClose());
  };
  
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

  const playSellSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/ETRA_TOIMII.wav')
      );
      setSellSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sell sound:', error);
    }
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
           {/*   <View style={styles.modalLine} />  */}
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/*    <View style={styles.rowContainer}> */}
                  <Text style={styles.monsterName}>{selectedMonster.name}</Text>
                  <Text style={styles.title}>{selectedMonster.title}</Text>
            {/*    </View>  */}

                <Text style={styles.rarity}>{selectedMonster.rarity} QReep</Text>
                <Text style={styles.age}>Age: {selectedMonster.age}</Text>
                <Text style={styles.nature}>Nature: {selectedMonster.nature}</Text>
                <Text style={styles.background}>{selectedMonster.background}</Text>
                {/* Add more monster details here */}
              </ScrollView>
            </>
          )}
          <View style={styles.modalLine} />
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleSellPress} style={styles.sellButton}>
                  <Text style={styles.sellButtonText}>Sell</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClosePress} style={styles.closeButton}>
                  <MaterialIcons name="close" size={50} color="black" />
                </TouchableOpacity>
              </View>
        </View>
      </View>
    </Modal>
 );
};

const styles = StyleSheet.create({
  modalLine: {
    height: 3,
    width: '100%',
    backgroundColor: 'black',
   // marginVertical: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 4,
    paddingTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '95%',
    height: '90%',
    paddingTop: 10,
    paddingBottom: 74,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    position: 'absolute',
    bottom: 2,
    width: '100%',
  },
  sellButton: {
    width: 100,
    height: 70,
    borderRadius: 20,
    borderColor: 'black',
    borderWidth: 3,
    backgroundColor: 'orange', // Customize the color for the Sell button
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellButtonText: {
    fontSize: 18,
    color: 'black', // Customize the text color for the Sell button
    fontWeight: 'bold',
  },
  closeButton: {
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
  image: {
    width: '95%', // Set the image width to 100% to fit the container
    height: '60%',
  //  marginBottom: 4,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'black',
  },
  textContainer: {
    flex: 1, // Add this line to make the text container take up the remaining space
    alignItems: "center",
  },
  monsterName: {
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  rarity: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  age: {
    fontSize: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  title: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  nature: {
    fontSize: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  background: {
    fontSize: 22,
    fontWeight: '400',
    color: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
 // Add more styles here
});

export default MonsterInfoModal;