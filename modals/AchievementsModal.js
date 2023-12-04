import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AchievementsModal = ({ visible, onClose, achievements }) => {
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
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
 {achievements.map((achievement, index) => (
   <View key={index} style={styles.achievementContainer}>
     <Text style={styles.achievementText}>{achievement.name}</Text>
     {/* Add more details about the achievement here */}
   </View>
 ))}
</ScrollView>
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
    justifyContent: 'center',
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
    achievementText: {
        fontSize: 16,
        marginBottom: 10,
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 60,
    },
    achievementContainer: {
      alignItems: 'left',
    },
    closeButton: {
        position: 'absolute',
        bottom: 20,
        width: 70,
        height: 70,
        borderRadius: 35,
        borderColor: 'black',
        borderWidth: 3,
        backgroundColor: 'salmon',
        alignItems: 'center',
        justifyContent: 'center',
      },
});

export default AchievementsModal;
