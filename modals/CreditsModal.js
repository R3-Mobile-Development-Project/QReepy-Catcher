import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CreditsModal = ({ visible, onClose }) => {
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
          <Text style={styles.creditText}>This app was created by:</Text>
          <Text style={styles.creditText}>Anssi Kulotie</Text>
          <Text style={styles.creditText}>Hannu Väliahde</Text>
          <Text style={styles.creditText}>Miikka Tyvelä</Text>
          <Text style={styles.creditText}>Niko Kolehmainen</Text>
          <View style={styles.modalLine} />
          <Text style={styles.creditText}>Oulu University of Applied Sciences</Text>
          <Text style={styles.creditText}>TVT22KMO, Mobile Project Group 3</Text>
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

export default CreditsModal;
