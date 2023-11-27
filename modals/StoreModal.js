import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getFirestore, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreditsModal = ({ visible, onClose }) => {
    const [closeSound, setCloseSound] = useState();
    const [imageLoading, setImageLoading] = useState(true);
    const [eggUrl, setEggUrl] = useState(null);
    const [userCoins, setUserCoins] = useState(0);

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

    // calculate a random number to fetch a random egg, between 1 and 10
    const randomNumber = Math.floor(Math.random() * 10) + 1;

    // fetch a random egg from Firebase storage
    const fetchRandomEgg = async () => {
        try {
            const storage = getStorage();
            const imageRef = ref(storage, `gs://qreepy-catcher.appspot.com/Eggs/egg${randomNumber}.jpg`);

            const url = await getDownloadURL(imageRef);
            return url;
        } catch (error) {
            console.error('Error fetching random egg:', error);
        }
    };

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
        if (userCoins >= 100) {
            // Deduct 100 coins from the user's coin quantity
            const userId = await AsyncStorage.getItem('userId');
            const newCoinQuantity = userCoins - 100;
            await AsyncStorage.setItem(`coins_${userId}`, newCoinQuantity.toString());

            // Fetch a random egg
            const eggUrl = await fetchRandomEgg();
            setEggUrl(eggUrl);
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
                        <TouchableOpacity onPress={handleBuyEggPress}>
                            <Text style={styles.modalHeaderText}>Buy Egg</Text>
                        </TouchableOpacity>

                        {/* create a carousel of eggs */}
                        <ScrollView horizontal={true}>
                            <View style={styles.eggContainer}>
                            {eggUrl && (
                                <Image
                                source={{ uri: eggUrl }}
                                style={styles.eggImage}
                                onLoad={() => setImageLoading(false)}
                                onError={(error) => {
                                    console.error('Error loading image:', error);
                                    setImageLoading(false);
                                    }}
                                />
                            )}
                            </View>
                        </ScrollView>
                        <View style={styles.coinContainer}>
                            <Image source={require('../assets/images/coin2.png')} style={styles.image} />
                            <Text style={styles.coinText}>{userCoins}</Text>
                        </View>

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
    modalHeaderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    eggContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        borderColor: 'black',
        borderWidth: 3,
    },
    eggImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    coinContainer: {
        position: 'absolute',
        top: 200,
        alignSelf: 'center',
        alignItems: 'center',
      },
    image: {
        width: 80, // Set the width as per your requirements
        height: 80, // Set the height as per your requirements
        borderRadius: 40, // Set the borderRadius as per your requirements
        borderWidth: 3,
        borderColor: 'white',
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

export default CreditsModal;
