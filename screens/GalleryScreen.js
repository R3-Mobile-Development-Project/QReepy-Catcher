import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { findMonster, fetchMonsterImageURL } from '../utils/monsterUtils';
import MonsterInfoModal from '../modals/MonsterInfoModal';
import { Audio } from 'expo-av';
import EggModal from '../modals/EggModal';
import { useSound } from '../utils/SoundContext';

const backgroundImage = require('../assets/images/horrible-monster-2.jpg');

const GalleryScreen = ({ navigation }) => {
  const [monsters, setMonsters] = useState([]);
  const [images, setImages] = useState([]);
  const [numColumns, setNumColumns] = useState(3);
  const [sortingMethod, setSortingMethod] = useState('id');
  const placeholders = Array.from({ length: (3 - monsters.length % 3) % 3 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState(null);
  const { areSoundsMuted } = useSound();
  const [sound, setSound] = useState();
  const [eggModalVisible, setEggModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const SORT_KEY = 'sorting_method';


  const handleItemPress = (monster) => {
    console.log(monster.name, 'opened on index:', monsters.indexOf(monster));
    const imageIndex = monsters.indexOf(monster);
    const imageUrl = images[imageIndex];
    setSelectedMonster({ ...monster, image: imageUrl });
    setIsModalVisible(true);
   };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Updated playButtonSound function
  const playButtonSound = async () => {
    if (!areSoundsMuted) {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/Menu_Selection_Click.wav')
      );
      setSound(sound);
      await sound.playAsync();
    }
  };

  const openEggModal = async () => {
    playButtonSound();
    setEggModalVisible(true);
  };

  const closeEggModal = async () => {
    refreshMonsters();
    playButtonSound();
    setEggModalVisible(false);
  };

  const onClose = () => {
    setIsModalVisible(false);
   };


  const sortMonstersAndImages = async () => {
    // Pair each monster with its image
    const paired = monsters.map((monster, index) => ({ monster, image: images[index] }));
   
    // Sort the pairs
    if (sortingMethod === 'name') {
      paired.sort((a, b) => a.monster.name.localeCompare(b.monster.name));
      console.log('SORTED BY NAME, paired:')
      paired.forEach(item => {
        console.log(`Name: ${item.monster.name}, ID: ${item.monster.id}`);
      });
    } else { // Default sort by ID
      paired.sort((a, b) => a.monster.id - b.monster.id);
      console.log('SORTED BY ID, paired:');
      paired.forEach(item => {
      console.log(`Name: ${item.monster.name}, ID: ${item.monster.id}`);
      });
    }
   
    // Separate the pairs back into monsters and images
    const sortedMonsters = paired.map(pair => pair.monster);
    const sortedImages = paired.map(pair => pair.image);
   
    setMonsters(sortedMonsters);
    setImages(sortedImages);
   
    // Save the sorting method to AsyncStorage
    try {
      // Convert the sortingMethod to a JSON string before saving
      await AsyncStorage.setItem(SORT_KEY, JSON.stringify(sortingMethod));
    } catch (error) {
      console.error('Error saving sorting method to AsyncStorage:', error);
    }
   };
   

  const saveSortingMethod = async (sortingMethod) => {
    try {
      // Convert the sortingMethod to a JSON string before saving
      await AsyncStorage.setItem(SORT_KEY, JSON.stringify(sortingMethod));
    } catch (error) {
      console.log('Error saving sorting method to AsyncStorage:', error);
    }
   };
   
   const getSortingMethod = async () => {
    try {
      const value = await AsyncStorage.getItem(SORT_KEY);
      if (value !== null) {
        // Parse the value back into its original form
        setSortingMethod(JSON.parse(value));
      }
    } catch (error) {
      console.log('Error retrieving sorting method from AsyncStorage:', error);
    }
   };

   useEffect(() => {
    getSortingMethod();
   }, []);

   useEffect(() => {
    saveSortingMethod(sortingMethod);
   }, [sortingMethod]);

   useEffect(() => {
    // Sort monsters and images when sorting method changes
    sortMonstersAndImages();
  }, [sortingMethod, monsters.length, images.length]); // Re-sort whenever the sorting method changes


  const calculateNumColumns = () => {
    return 3;
  };

  useEffect(() => {
    // Update the number of columns dynamically based on your logic
    const updatedNumColumns = calculateNumColumns();
    setNumColumns(updatedNumColumns);
  }, []);

    // Use useFocusEffect to refresh monsters when the screen is focused
    useFocusEffect(
      React.useCallback(() => {
        refreshMonsters();
      }, [sortingMethod])
    );

// Function to sort monsters
const sortMonsters = (monsters) => {
  if (sortingMethod === 'name') {
    // Sort by name
    return [...monsters].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default sort by ID
    return [...monsters].sort((a, b) => a.id - b.id);
  }
};

// Function to get images based on monster IDs
const getImages = async (monsterIds) => {
  try {
    const cachedImages = {}; // Simple in-memory cache

    const imagePromises = monsterIds.map(async (monsterId) => {
      if (cachedImages[monsterId]) {
        return cachedImages[monsterId];
      }

      const imageUrl = await fetchMonsterImageURL(monsterId);
      cachedImages[monsterId] = imageUrl;

      return imageUrl;
    });

    return Promise.all(imagePromises);
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

//use the getImages function to get the images for the monsters
const refreshMonsters = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const monstersData = await AsyncStorage.getItem(`monsters_${userId}`);
    const monsters = monstersData ? JSON.parse(monstersData) : [];
    const sortedMonsters = sortMonsters(monsters);

    // Set the sorted monsters first
    setMonsters(sortedMonsters);
    // Then get the images for the monsters
    const monsterIds = sortedMonsters.map(monster => monster.id);
    const images = await getImages(monsterIds);
    setImages(images);

  } catch (error) {
    console.error('Error retrieving monsters from AsyncStorage:', error);
  }
};

/*
const closeMonsterInfoModal = () => {
 setIsModalVisible(false);
};
*/

return (
  <View style={styles.container}>
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">

    <View style={styles.sortingContainer}>
  <TouchableOpacity onPress={() => setSortingMethod('id')}>
    <Icon name="sort" size={30} color={sortingMethod === 'id' ? 'white' : 'black'} />
  </TouchableOpacity>
  <TouchableOpacity onPress={openEggModal}>
    <Ionicons name="egg-outline" size={30} color="black" />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setSortingMethod('name')}>
    <Icon name="sort-by-alpha" size={30} color={sortingMethod === 'name' ? 'white' : 'black'} />
  </TouchableOpacity>
</View>


      <View style={styles.contentContainer}>
        <Text style={styles.text}>My collected QReeps!</Text>
        <FlatList
          data={[...monsters, ...placeholders]}
          keyExtractor={(item, index) => `monster_${index}`}
          numColumns={numColumns}



          renderItem={({ item, index }) => {
            if (!item) {
              // Render an invisible view for the placeholder
              return <View style={[styles.monsterContainer, styles.invisible]} />;
            }

            // Render the actual monster item
            return (
              <View style={styles.monsterContainer}>
              {images[index] ? (
                <TouchableOpacity onPress={() => handleItemPress(item)}>
                  <Image
                    source={{ uri: images[index] }}
                    style={styles.image}  // Set fixed width and height for testing
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="black" />
                </View>
              )}
              <Text style={styles.monsterName}>{item.name}</Text>
            </View>
            );
          }}
        />
      </View>
    </ImageBackground>

    {/* Modal for displaying monster details */}

    <MonsterInfoModal
      isModalVisible={isModalVisible}
      selectedMonster={selectedMonster}
      onClose={onClose}
      onSell={refreshMonsters}
    />
    <EggModal visible={eggModalVisible} onClose={closeEggModal} />
  </View>
);



};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  monsterContainer: {
    marginBottom: 20,
    alignItems: 'center',
    width: '33%', // Set the width to 33% for three columns
    padding: 8, // Add padding to separate the columns
  },
  loadingContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'black',
  },
  image: {
    width: 110, // Set the image width to 100% to fit the container
    height: 110,
    marginBottom: 4,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'black',
  },
  monsterName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  invisible: {
    backgroundColor: 'transparent',
  },
  sortingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
});

export default GalleryScreen;