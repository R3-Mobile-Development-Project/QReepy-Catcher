import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Animated, Easing } from 'react-native';
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
    const [eggQuantity, setEggQuantity] = useState(0);
    const eggCost = 1; // VAIHDA TÄMÄN ARVOA
    const totalCost = eggQuantity * eggCost;

    const spinValue = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
            fetchRandomEgg();
            startSpinAnimation();
        }, [visible])
    );

    useEffect(() => {
        return () => {
            if (closeSound) {
                closeSound.unloadAsync();
            }
            spinValue.setValue(0);
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
        setEggQuantity(0);
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

    const incrementEggQuantity = () => {
        setEggQuantity(eggQuantity + 1);
    };

    const decrementEggQuantity = () => {
        if (eggQuantity > 1) {
            setEggQuantity(eggQuantity - 1);
        }
    };

    const handleBuyEggPress = async () => {
        // Check if user has enough coins to buy the selected quantity of eggs
        if (userCoins >= totalCost) {
            // Deduct coins from the user's coin quantity
            const userId = await AsyncStorage.getItem('userId');
            const newCoinQuantity = userCoins - totalCost;
            await AsyncStorage.setItem(`coins_${userId}`, newCoinQuantity.toString());
            setUserCoins(newCoinQuantity);
            setEggQuantity(0);
            // Fetch a new random egg
            fetchRandomEgg();
        } else {
            // User does not have enough coins to buy the selected quantity of eggs
            alert('Not enough coins!');
        }
    };

    const startSpinAnimation = () => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 10000, // Adjust the duration as needed
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    useEffect(() => {
        if (visible) {
            startSpinAnimation();
        }
    }, [visible]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

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
                        <View style={styles.quantityContainer}>
                        {/* plus and minus buttons for egg quantity */}
                        <TouchableOpacity onPress={decrementEggQuantity} style={styles.quantityButton}>
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalHeaderText}>{eggQuantity}</Text>
                        <TouchableOpacity onPress={incrementEggQuantity} style={styles.quantityButton}>
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                        </View>
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
                            {/* display the total cost */}
                       {/*     <Text style={styles.modalHeaderText}>Total Cost: {eggQuantity} coins</Text>  */}
                            {/* display the user's coin quantity */}
                            <View style={styles.coinContainer}>
                            <Text style={styles.coinText}>{userCoins} - {totalCost}</Text>
                            <Animated.Image
                            source={require('../assets/images/coin2.png')}
                            style={[styles.image, { transform: [{ rotate: spin }] }]}
                            />
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
        borderWidth: 3,
        borderColor: 'black',
      },
    modalHeader: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantityButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 2,
        marginHorizontal: 10,
    },
    quantityButtonText: {
        fontSize: 20,
        color: 'white',
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
        bottom: 0,
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
