import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AchievementsModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Achievements</Text>
          <View style={styles.modalLine} />
          <ScrollView style={{ flex: 1 }}>
          <Text>Here is some content for the modal</Text>
          <Text>Here is some more content for the modal</Text>
          <Text>Here is even more content for the modal</Text>
          {/* Add your achievements content here */}
          </ScrollView>
            <View style={styles.modalLine} />
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
    backgroundColor: 'lightyellow',
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
        marginVertical: 10,
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
});

export default AchievementsModal;
