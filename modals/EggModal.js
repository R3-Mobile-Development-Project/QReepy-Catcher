import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, Image, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getFirestore, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const EggModal = ({ visible, onClose }) => {
    const [savedEggs, setSavedEggs] = useState([]);
    const [numColumns, setNumColumns] = useState(3);
    const placeholders = Array.from({ length: (3 - savedEggs.length % 3) % 3 });
    const [selectedEggIndex, setSelectedEggIndex] = useState(null);
    const [isHatching, setIsHatching] = useState(false);
    const [caughtMonsters, setCaughtMonsters] = useState(0); // New state to track monsters caught
    const [isHatched, setIsHatched] = useState(false); // New state to track if the egg is hatched
    const [isTrackingEgg, setIsTrackingEgg] = useState(false);
    const neededMonsters = 3;

    //const [hatchedEggState, setHatchedEggState] = useState({ index: null, borderColor: 'red' });

    //const borderColor = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        React.useCallback(() => {
            // Fetch the initial count of caught monsters when the screen is focused
            fetchCaughtMonstersCount();
            fetchTrackingEgg();
        }, [])
    );

    useEffect(() => {
        // Fetch saved eggs from AsyncStorage
        const fetchSavedEggs = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const boughtEggs = await AsyncStorage.getItem(`boughtEggs_${userId}`);

                if (boughtEggs) {
                    setSavedEggs(JSON.parse(boughtEggs));
                }

                // Fetch the stored selected egg index
                const selectedEggIndex = await AsyncStorage.getItem(`selectedEggIndex_${userId}`);
                setSelectedEggIndex(selectedEggIndex ? parseInt(selectedEggIndex) : null);

                // Check if the selected egg is actively hatching
                const isTrackingEgg = await AsyncStorage.getItem(`isTrackingEgg_${userId}`);
                setIsTrackingEgg(isTrackingEgg === 'true');

            } catch (error) {
                console.error('Error fetching saved eggs:', error);
            }
        };

        fetchSavedEggs();
    }, [visible]);

    /*
    const animatedBorderColor = borderColor.interpolate({
        inputRange: [0, 1],
        outputRange: [hatchedEggState.borderColor, 'green'],
    });
*/

    useEffect(() => {
        // Fetch the initial count of caught monsters when the component mounts
        fetchCaughtMonstersCount();
    }, []);

    const fetchCaughtMonstersCount = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const caughtMonsters = await AsyncStorage.getItem(`caughtMonsters_${userId}`);
            // Parse the caughtMonsters array and get its length
            const parsedCaughtMonsters = caughtMonsters ? JSON.parse(caughtMonsters).length : 0;
            // Set the count of caught monsters
            setCaughtMonsters(parsedCaughtMonsters);
        } catch (error) {
            console.error('Error fetching caught monsters count:', error);
        }
    };

    const fetchTrackingEgg = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const isTrackingEgg = await AsyncStorage.getItem(`isTrackingEgg_${userId}`);
            const selectedEggIndex = await AsyncStorage.getItem(`selectedEggIndex_${userId}`);
            setSelectedEggIndex(selectedEggIndex ? parseInt(selectedEggIndex) : null);
            setIsTrackingEgg(isTrackingEgg === 'true');
        } catch (error) {
            console.error('Error fetching tracking egg:', error);
        }
    };

    const startHatching = async (index) => {
        if (!isTrackingEgg) {
            const userId = await AsyncStorage.getItem('userId');

            // Clear caughtMonsters array
            const parsedExistingMonsters = [];
            await AsyncStorage.setItem(`caughtMonsters_${userId}`, JSON.stringify(parsedExistingMonsters));

            const storedMonsterIdsString = await AsyncStorage.getItem(`caughtMonsters_${userId}`);
            console.log(`EGGMODAL: ${storedMonsterIdsString} monsters caught for user ID: ${userId}`);

            setCaughtMonsters(0);
            setIsTrackingEgg(true);

            // If not already hatching, start the process
            setIsHatching(true);
            // Save the selected egg index to AsyncStorage
            await AsyncStorage.setItem(`selectedEggIndex_${userId}`, index.toString());
            // Save the isTrackingEgg state to AsyncStorage
            await AsyncStorage.setItem(`isTrackingEgg_${userId}`, 'true');
            // Check if the number of caught monsters is 20
            if (caughtMonsters >= neededMonsters) {
                setIsHatched(true);
                // setHatchedEggState({ index, borderColor: 'green' });
                setCaughtMonsters(0);
                setIsTrackingEgg(false);
                // Optionally, you might want to clear the storage here
                await AsyncStorage.removeItem(`caughtMonsters_${userId}`);
                console.log(`EGGMODAL: Cleared caught monsters for user ID: ${userId}`);
            }
        }
    };

        const selectEgg = (index) => {
            if (!isTrackingEgg) {
                setSelectedEggIndex(index);
            } else if (caughtMonsters < neededMonsters){
                alert('Catch QReeps to hatch the egg!');
            } else {
                hatchEgg(index);
            }
         };

    //function for hatching the egg, getting the monster, saving the monster, clearing the caught monsters and deleting the egg
    const hatchEgg = async (index) => {
      //  await AsyncStorage.getItem(`selectedEggIndex_${userId}`, index.toString());
        const userId = await AsyncStorage.getItem('userId');
        console.log(`EGGMODAL: Hatched egg at index ${index} for user ID: ${userId}`);
        const boughtEggs = await AsyncStorage.getItem(`boughtEggs_${userId}`);
        console.log(`EGGMODAL: Bought eggs: ${boughtEggs}`);
        const parsedExistingMonsters = [];
        await AsyncStorage.setItem(`caughtMonsters_${userId}`, JSON.stringify(parsedExistingMonsters));
        const storedMonsterIdsString = await AsyncStorage.getItem(`caughtMonsters_${userId}`);
        console.log(`EGGMODAL: ${storedMonsterIdsString} monsters caught for user ID: ${userId}`);
        setCaughtMonsters(0);
        setIsTrackingEgg(false);
        setIsHatching(false);
        const selectedEggIndex = await AsyncStorage.getItem(`selectedEggIndex_${userId}`);
        await AsyncStorage.removeItem(`selectedEggIndex_${userId}`);
        console.log(`EGGMODAL: Removed selected egg: ${selectedEggIndex} for user ID: ${userId}`)
        const isTrackingEgg = await AsyncStorage.getItem(`isTrackingEgg_${userId}`);
        await AsyncStorage.setItem(`isTrackingEgg_${userId}`, 'false');
        console.log(`EGGMODAL: Removed tracking egg: ${isTrackingEgg} for user ID: ${userId}`)
        //delete egg from async storage
        const parsedBoughtEggs = JSON.parse(boughtEggs);
        parsedBoughtEggs.splice(index, 1);
        await AsyncStorage.setItem(`boughtEggs_${userId}`, JSON.stringify(parsedBoughtEggs));
        setSavedEggs(parsedBoughtEggs);
        console.log(`EGGMODAL: Removed egg at index ${index} for user ID: ${userId}`)
        console.log(`EGGMODAL: Remaining eggs: ${parsedBoughtEggs}`);

/*
        if (isHatching) {
            setIsHatching(false);
            setIsHatched(true);
            setIsTrackingEgg(false);
            setCaughtMonsters(0);
            const userId = await AsyncStorage.getItem('userId');
            await AsyncStorage.setItem(`caughtMonsters_${userId}`, JSON.stringify(0));
            await AsyncStorage.removeItem(`selectedEggIndex_${userId}`);
            await AsyncStorage.setItem(`isTrackingEgg_${userId}`, false);
            //fetch monster from firestore and image from storage
            //save monster to async storage
            console.log(`EGGMODAL: Hatched egg at index ${index} for user ID: ${userId}`);

            //delete egg from async storage
            const boughtEggs = await AsyncStorage.getItem(`boughtEggs_${userId}`);
            const parsedBoughtEggs = JSON.parse(boughtEggs);
            parsedBoughtEggs.splice(index, 1);
            await AsyncStorage.setItem(`boughtEggs_${userId}`, JSON.stringify(parsedBoughtEggs));
            setSavedEggs(parsedBoughtEggs);
        }
        */
    }


    return (
        <Modal
            animationType="fade"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalHeaderText}>Saved Eggs</Text>
                    <FlatList
                    data={[...savedEggs, ...placeholders]}
                    numColumns={numColumns}
                    renderItem={({ item, index }) => (
                    item ? (
                    <View style={styles.eggContainer}>
                    <TouchableOpacity
                    onPress={() => selectEgg(index)}
                    disabled={isTrackingEgg && selectedEggIndex !== index}
                    >
                    {item.eggUrl ? (
                      <View>
                          <Animated.Image
                              source={{ uri: item.eggUrl }}
                              style={[
                                styles.eggImage, isHatched && styles.greyedImage,
                                 { borderColor: selectedEggIndex === index ? 'darkorange' : 'black' },
                                 isTrackingEgg && selectedEggIndex !== index && styles.disabledEgg,
                              ]}
                          />
                          {selectedEggIndex === index && isTrackingEgg && (
                              <Text style={styles.monstersCountText}>{`${caughtMonsters}/${neededMonsters}`}</Text>
                          )}
                      </View>
                    ) : (
                      <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="black" />
                      </View>
                    )}
                </TouchableOpacity>
           </View>
       ) : null
   )}
   keyExtractor={(item, index) => index.toString()}
/>
                    <TouchableOpacity onPress={() => {
                        startHatching(selectedEggIndex);
                     //   setTimeout(() => {
                        fetchCaughtMonstersCount();
                     //   }, 500);
                    }}>
                        <Text>Start Hatching</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    disabledEgg: {
        opacity: 0.5,
        // Add any other styles to visually indicate that the egg is disabled
    },
    hatchButton: {
        width: '100%',
        height: 50,
        backgroundColor: 'green',
        borderColor: 'black',
        borderWidth: 3,
      },
      monstersCountText: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
      },
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
        borderWidth: 4,
    },
    greyedImage: {
        // Apply styles to make the image appear greyed out
        opacity: 0.5,
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