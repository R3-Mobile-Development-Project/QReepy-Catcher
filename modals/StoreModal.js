import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getFirestore, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const StoreModal = ({ visible, onClose }) => {
    const [closeSound, setCloseSound] = useState();
    const [imageLoading, setImageLoading] = useState(true);
    const [eggUrl, setEggUrl] = useState(null);
    const [userCoins, setUserCoins] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            fetchRandomEgg();
        }, [])
    );

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

    // fetch coins from async storage using the userId
    const fetchCoinQuantity = async (userId) => {
        const coins = await AsyncStorage.getItem(`coins_${userId}`);
        // If coins exist, return the quantity as a number
        if (coins) {
            return parseInt(coins);
        }
        // If coins do not exist, return 0
        return 0;
    };

    // fetch a random egg from Firebase storage
    const fetchRandomEgg = async () => {
        try {
            const storage = getStorage();
            const randomNumber = Math.floor(Math.random() * 10) + 1;
            const eggFileFormats = {
                1: 'jpg',
                2: 'jpg',
                3: 'jpg',
                4: 'jpg',
                5: 'png',
                6: 'png',
                7: 'png',
                8: 'png',
                9: 'png',
                10: 'png',
            };
            const fileFormat = eggFileFormats[randomNumber];
            if (!fileFormat) {
                throw new Error(`No file format specified for egg ${randomNumber}`);
            }
            const imageRef = ref(storage, `gs://qreepy-catcher.appspot.com/Eggs/egg${randomNumber}.${fileFormat}`);
            const url = await getDownloadURL(imageRef);
            setEggUrl(url);
        } catch (error) {
            console.error('Error fetching random egg:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchRandomEgg();
    }, []);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // Retrieve userId from AsyncStorage
            const userId = await AsyncStorage.getItem('userId');

            if (!userId) {
                console.error('No userId found in AsyncStorage');
                return;
            }

            // Fetch user's coin quantity
            const coinQuantity = await fetchCoinQuantity(userId);
            setUserCoins(coinQuantity);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleBuyEggPress = async () => {
        // Check if user has enough coins to buy an egg
        if (userCoins >= 1) {
            // Deduct 100 coins from the user's coin quantity
            const userId = await AsyncStorage.getItem('userId');
            const newCoinQuantity = userCoins - 1;
            await AsyncStorage.setItem(`coins_${userId}`, newCoinQuantity.toString());
            setUserCoins(newCoinQuantity);
        } else {
            // User does not have enough coins to buy an egg
            alert('Not enough coins!');
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        {/* create a button to buy a random egg */}
                        <TouchableOpacity onPress={handleBuyEggPress} style={styles.buyEggButton}>
                            <Text style={styles.modalHeaderText}>Buy Egg</Text>
                        </TouchableOpacity>

                        {/* create a carousel of eggs */}
                        <ScrollView>
                            <View style={styles.eggContainer}>
                            {eggUrl ? (
                                <Image
                                source={{ uri: eggUrl }}
                                style={styles.eggImage}
                                onLoad={() => setImageLoading(false)}
                                onError={(error) => {
                                    console.error('Error loading image:', error);
                                    setImageLoading(false);
                                    }}
                                />
                                ) : (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="black" />
                                </View>
                            )}
                            </View>
                            <View style={styles.coinContainer}>
                            <Image source={require('../assets/images/coin2.png')} style={styles.image} />
                            <Text style={styles.coinText}>{userCoins}</Text>
                        </View>
                        </ScrollView>
                        <TouchableOpacity onPress={handleClosePress} style={styles.closeButton}>
                            <MaterialIcons name="close" size={50} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

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
        backgroundColor: 'purple',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
    modalHeader: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    buyEggButton: {
        width: 110,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 3,
        marginBottom: 20,
    },
    modalHeaderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
      //  margin: 20,
    },
    eggContainer: {
        width: 240,
        height: 240,
        borderRadius: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        borderColor: 'black',
        borderWidth: 3,
        marginBottom: 20,
    },
    eggImage: {
        width: 240,
        height: 240,
        borderRadius: 120,
        borderWidth: 2,
        borderColor: 'black',
    },
    loadingContainer: {
        width: 240,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderRadius: 120,
        borderWidth: 2,
        borderColor: 'black',
      },
    coinContainer: {
      //  position: 'absolute',
        top: 0,
        alignSelf: 'center',
        alignItems: 'center',
      },
    image: {
        width: 100, // Set the width as per your requirements
        height: 100, // Set the height as per your requirements
        borderRadius: 50, // Set the borderRadius as per your requirements
        borderWidth: 3,
        borderColor: 'black',
      },
    coinText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
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
      closeButtonText: {
        fontSize: 18,
      },
});

export default StoreModal;
