// AdModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Image, StyleSheet } from 'react-native';

const AdModal = ({ isVisible, onClose, adContent }) => {
  useEffect(() => {
    let timer;
    if (isVisible) {
      timer = setTimeout(() => {
        onClose(); // Close the modal after 3 seconds
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Image 
            source={adContent.image} // Use the adContent prop for the image source
            style={styles.image}
          />
          {/* Additional content can go here */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    // Container for the modal view
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalView: {
      backgroundColor: 'white',
      borderRadius: 5,
      padding: 3,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: '100%', // Adjust width as needed
      height: '100%', // Adjust height as needed
    },
    image: {
      width: '100%', // Adjust as needed
      height: '100%', // Adjust as needed
      resizeMode: 'cover', // Avoids scaling the image
    },
    // ... other styles ...
  });
  

export default AdModal;
