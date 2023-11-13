import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ScanningModal = ({ isVisible, onClose, openGallery, image, name }) => {
  return (
    <Modal
        animationType="fade"
        isVisible={isVisible}
        onRequestClose={onClose}
        transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
        <Image source={{ uri: image }} style={styles.image} />
        <Text style={styles.name}>{name}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => console.log('Sell button pressed')}>
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
    bottom: 50,
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
