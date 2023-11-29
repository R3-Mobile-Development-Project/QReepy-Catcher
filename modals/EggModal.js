import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EggModal = ({ visible, onClose }) => {
    const [savedEggs, setSavedEggs] = useState([]);
    const [numColumns, setNumColumns] = useState(3);
    const placeholders = Array.from({ length: (3 - savedEggs.length % 3) % 3 });


    useEffect(() => {
        // Fetch saved eggs from AsyncStorage
        const fetchSavedEggs = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const boughtEggs = await AsyncStorage.getItem(`boughtEggs_${userId}`);

                if (boughtEggs) {
                    setSavedEggs(JSON.parse(boughtEggs));
                }
            } catch (error) {
                console.error('Error fetching saved eggs:', error);
            }
        };

        fetchSavedEggs();
    }, [visible]);

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalHeaderText}>Saved Eggs</Text>
                    <FlatList
                        data={[...savedEggs, ...placeholders]}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={numColumns}
                        renderItem={({item, index}) => (
                        item ? (
                        <View style={styles.eggContainer}>
                            {item.eggUrl ? (
                                <Image source={{ uri: item.eggUrl }} style={styles.eggImage} />
                            ) : (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="black" />
                            </View>
                            )}
                        </View>
                        ) : (
                        <View style={[styles.eggContainer, styles.invisible]} />
                        )
                        )}
                    />
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
        padding: 20,
      },
      modalContent: {
        width: '100%',
        height: '80%',
        backgroundColor: 'seashell',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'black',
      },
    modalHeaderText: {
        height: 30,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    eggContainer: {
        marginBottom: 20,
        marginHorizontal: 2,
    },
    loadingContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'black',
      },
    eggImage: {
        width: 100,
        height: 100,
        marginBottom: 4,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'black',
    },
    noEggsText: {
        fontSize: 16,
        color: 'gray',
        marginTop: 20,
    },
    closeButton: {
        position: 'absolute',
        bottom: -55,
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
});

export default EggModal;
