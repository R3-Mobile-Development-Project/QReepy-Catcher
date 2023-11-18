import React, {useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const ScanningModal = ({ isVisible, onClose, openGallery, monsterInfo, imageURL }) => {
  const [sellSound, setSellSound] = useState();
  const [openModalSound, setOpenModalSound] = useState();
  const [imageLoading, setImageLoading] = useState(true);
  const monsterColor = monsterInfo[0]?.dominantColors;
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const toggleInfoModal = () => {
    setInfoModalVisible(!infoModalVisible);
  };

  const renderInfoModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.infoModalContainer}>
          <View style={[styles.infoModalTextContainer, { backgroundColor: `rgb(${monsterColor.join(', ')})` }]}>
          <Text style={styles.infoModalText}>
            You can sell your catch for a Qreepy Coin,
            and later spend your Coins by purchasing Qreepy Eggs from the store!
          </Text>
          <Text style={styles.infoModalText}>
            You can also view the QReep in the Gallery, where you can see more information about it.
            All your caught QReeps will be saved there, should you choose not to sell them.
          </Text>
          <TouchableOpacity onPress={() => setInfoModalVisible(false)} style={styles.infoModalCloseButton}>
            <MaterialIcons name="close" size={50} color="black" />
          </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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

  const playOpenModalSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/Win-sound.wav')
      );
      setOpenModalSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing open modal sound:', error);
    }
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

  const handleGalleryPress = () => {
    openGallery(); // Replace 'Gallery' with the name of your gallery screen
    onClose(); // Close the modal
  };


  return (
    <Modal
        animationType="fade"
        isVisible={isVisible}
        onRequestClose={onClose}
        transparent={true}
    >
      <View style={styles.modalContainer}>
      <View style={[styles.modalContent, { backgroundColor: `rgb(${monsterColor.join(', ')})` }]}>

        <Text style={styles.modalText}>YOU CAUGHT A QREEP!</Text>
        {/* Position info icon button under the bottom right corner of the picture */}
        <TouchableOpacity onPress={toggleInfoModal} style={styles.infoButton}>
                <MaterialIcons name="info" size={40} color="black" />
              </TouchableOpacity>
          <View style={styles.modalLine} />

        {/* Add a conditional check for imageUrl before using it */}
        {imageURL && (
            <Image
              source={{ uri: imageURL }}
              style={styles.image}
              onLoad={() => setImageLoading(false)}
              onError={(error) => {
                console.error('Error loading image:', error);
                setImageLoading(false);
              }}
            />
          )}

          {imageLoading && <Text>Loading image...</Text>}

          {monsterInfo.map((monster, index) => (
            <View key={index}>
              <Text style={styles.name}>{monster.name}</Text>
              <Text style={styles.title}>{monster.title}</Text>
            </View>
          ))}
          <View style={styles.modalLine} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSellPress}>
            <Text style={styles.buttonText}>Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleGalleryPress}>
            <Text style={styles.buttonText}>View in Gallery</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={50} color="black" />
        </TouchableOpacity>

        {/* Render the info modal */}
        {renderInfoModal()}
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
        width: '90%',
        height: '84%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
      },
      modalText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
      },
      modalLine: {
        height: 3,
        width: '100%',
        backgroundColor: 'black',
        marginVertical: 14,
      },
  image: {
    width: 340,
    height: 340,
    borderRadius: 8,
    marginBottom: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
  },
  title: {
    fontSize: 18,
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white background
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 8, // Add border radius for rounded corners
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
  infoModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  infoModalTextContainer: {
    width: '80%',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoModalText: {
    fontSize: 18,
    color: 'black',
    padding: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Customize the background color
  },
  infoModalCloseButton: {
    marginTop: 20,
    width: 70,
    height: 70,
    borderRadius: 25,
    borderColor: 'black',
    borderWidth: 3,
    backgroundColor: 'salmon',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButton: {
    position: 'absolute',
    right: 0,
  },
});

export default ScanningModal;
