import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Animated, Easing, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getFirestore, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSound } from '../utils/SoundContext'; // Import useSound hook

const StoreModal = ({ visible, onClose }) => {
    const [closeSound, setCloseSound] = useState();
    const [imageLoading, setImageLoading] = useState(true);
    const [eggUrl, setEggUrl] = useState(null);
    const [userCoins, setUserCoins] = useState(0);
    const [eggQuantity, setEggQuantity] = useState(0);
    const eggCost = 1; // VAIHDA TÄMÄN ARVOA
    const totalCost = eggQuantity * eggCost;
    const [eggBought, setEggBought] = useState(false);
    const [message, setMessage] = useState('');
    const [timer, setTimer] = useState(null);
    const [fetchingEgg, setFetchingEgg] = useState(false);
    const { areSoundsMuted } = useSound(); // Use the useSound hook

    const spinValue = useRef(new Animated.Value(0)).current;
    const spinValueRef = useRef(spinValue);

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
            fetchRandomEgg();
            spinValue.setValue(0);
        }, [visible])
    );

    useEffect(() => {
        return () => {
            if (closeSound) {
                closeSound.unloadAsync();
            }
            spinValueRef.current.stopAnimation(); // Stop the spin animation
            spinValueRef.current.setValue(0); // Reset spin value to 0
        };
    }, [closeSound]);

    // Updated playCloseSound function
    const playCloseSound = async () => {
        if (!areSoundsMuted) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/sounds/Menu_Selection_Click.wav')
            );
            setCloseSound(sound);
            await sound.playAsync();
        }
    };

    const handleClosePress = () => {
        playCloseSound();
        setEggBought(false); // Reset egg state on modal close
        setEggQuantity(0);
        spinValue.setValue(0);
        onClose();
    };

    // fetch coins from async storage using the userId
    const fetchCoinQuantity = async (userId) => {
        const coins = await AsyncStorage.getItem(`coins_${userId}`);
        // If coins exist, return the quantity as a number
        if (coins) {
            return parseInt(coins); //JOS 0 KOLIKKOA, VAIHDA ARVO HALUTTUUN SUMMAAN, OSTA MUNA NIIN PÄIVITTYY, VAIHDA SITTEN TAKAISIN coins
        }
        // If coins do not exist, return 0
        return 0; //JOS KOLIKOITA, VAIHDA ARVO HALUTTUUN SUMMAAN, OSTA MUNA NIIN PÄIVITTYY, VAIHDA SITTEN TAKAISIN 0
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
            console.log('Egg:', randomNumber);

            // Fetch monster data using the determined monsterId
            const db = getFirestore();
            const q = query(collection(db, 'monsters'), where('id', 'in', [randomNumber, randomNumber + 10, randomNumber + 20, randomNumber + 30, randomNumber + 40]));

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const monsterData = doc.data();
                console.log('Monster Data:', monsterData.id);
            });
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

    // Updated playSellSound function
    const playSellSound = async () => {
        if (!areSoundsMuted) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/sounds/ETRA_TOIMII.wav')
            );
            setCloseSound(sound);
            await sound.playAsync();
        }
    };

    const handleBuyEggPress = async () => {
        if (fetchingEgg) {
            return;
        }
        if (eggQuantity > 0) {
        // Check if user has enough coins to buy the selected quantity of eggs
        if (userCoins >= totalCost) {
            playSellSound();
            // Deduct coins from the user's coin quantity
            const userId = await AsyncStorage.getItem('userId');
            const newCoinQuantity = userCoins - totalCost;
            await AsyncStorage.setItem(`coins_${userId}`, newCoinQuantity.toString());
            setUserCoins(newCoinQuantity);

            // Save the bought egg to AsyncStorage
            const boughtEggs = await AsyncStorage.getItem(`boughtEggs_${userId}`);
            const newBoughtEggs = boughtEggs ? JSON.parse(boughtEggs) : [];

            // Add the bought egg data to the array
            for (let i = 0; i < eggQuantity; i++) {
                newBoughtEggs.push({
                    eggUrl,
                    // Add other relevant egg data if needed
                });
            }

            // Save the updated array back to AsyncStorage
            await AsyncStorage.setItem(`boughtEggs_${userId}`, JSON.stringify(newBoughtEggs));
            console.log('Saved bought eggs to AsyncStorage:', newBoughtEggs);

            setEggQuantity(0);
            // Update state to indicate the egg has been bought
            setEggBought(true);
            if(eggQuantity > 1) {
            setMessage(`+${eggQuantity} eggs added to your Collection`);
            } else {
            setMessage(`+${eggQuantity} egg added to your Collection`);
            }
            // Reset the message after 3 seconds
            const newTimer = setTimeout(() => {
                fetchRandomEgg();
                setEggBought(false);
                setFetchingEgg(false);
                setMessage('');
            }, 3000);
            stopSpinAnimation();
            setTimer(newTimer);
            setFetchingEgg(true);
        } else {
            playCloseSound();
            // User does not have enough coins to buy the selected quantity of eggs
            const coinMessage = 'You need more coins!'
            Alert.alert('Uh oh', coinMessage, [{ text: 'OK' }], { cancelable: true });
        }
        } else {
            playCloseSound();
            // User has not selected a quantity of eggs
            const quantityMessage = "You tried to buy 0 eggs.\nYou know that's not a good deal."
            Alert.alert('Uh oh', quantityMessage, [{ text: 'OK' }], { cancelable: true });
        }
    };

    const startSpinAnimation = () => {
        spinValue.stopAnimation(); // Stop the current spin animation
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 10000, // Adjust the duration as needed
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const stopSpinAnimation = () => {
        spinValue.stopAnimation(); // Stop the current spin animation
        spinValue.setValue(0); // Reset spin value to 0
    };
    

    useEffect(() => {
        if (visible || eggBought) {
       //     stopSpinAnimation();
            startSpinAnimation();
        }
    }, [visible, eggBought]);

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
                        <TouchableOpacity
                            onPress={handleBuyEggPress}
                            style={styles.buyEggButton}
                            disabled={fetchingEgg}
                            >
                            <Text style={styles.modalHeaderText}>Buy Egg</Text>
                        </TouchableOpacity>

                        <ScrollView>
                            <View style={styles.eggContainer}>
                            {eggUrl ? (
                                <Image
                                    source={{ uri: eggUrl }}
                                    style={[styles.eggImage, eggBought && styles.greyedImage]}
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
                            source={require('../assets/images/coin4.png')}
                            style={[styles.image, { transform: [{ rotate: spin }] }]}
                            />
                        </View>
                        </ScrollView>
                        <View style={styles.closeButtonContainer}>
                        <TouchableOpacity onPress={handleClosePress} style={styles.closeButton}>
                            <MaterialIcons name="close" size={50} color="black" />
                        </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            {eggBought && (
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>{message}</Text>
                </View>
            )}
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
        width: 180,
        height: 180,
        borderRadius: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        borderColor: 'black',
        borderWidth: 3,
        marginBottom: 20,
    },
    eggImage: {
        width: '100%',
        height: '100%',
        borderRadius: 120,
    //    borderWidth: 2,
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
    closeButtonContainer: {
      //  position: 'absolute',
        //bottom: 10,
        width: '100%',
        alignItems: 'center',
      },
    closeButton: {
 //       position: 'absolute',
        bottom: -30,
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
      greyedImage: {
        // Apply styles to make the image appear greyed out
        opacity: 0.5,
    },
    messageContainer: {
        position: 'absolute',
        top: '70%', // Adjust as needed
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999, // Ensure it's above other components
    },
    messageText: {
        fontSize: 18,
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 5,
    },
});

export default StoreModal;
