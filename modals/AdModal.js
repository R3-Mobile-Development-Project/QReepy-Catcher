// AdModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const AdModal = ({ isVisible, onClose, adContent }) => {
  useEffect(() => {
    let timer;
    if (isVisible) {
      timer = setTimeout(onClose, 3000);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);

  const handlePress = () => {
    Linking.openURL(adContent.url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <TouchableOpacity style={styles.modalView} onPress={handlePress}>
          <Image 
            source={adContent.image}
            style={styles.image}
          />
          {/* Additional content can go here */}
        </TouchableOpacity>
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
      width: screenWidth * 0.99, // 90% of screen width
      height: screenHeight * 0.99, // 90% of screen height
      resizeMode: 'contain',
    },
    
    // ... other styles ...
  });
  

export default AdModal;