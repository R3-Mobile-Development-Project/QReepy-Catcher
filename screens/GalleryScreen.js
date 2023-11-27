import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { findMonster, fetchMonsterImageURL } from '../utils/monsterUtils';

const backgroundImage = require('../assets/images/horrible-monster-2.jpg');

const GalleryScreen = ({ navigation }) => {
  const [monsters, setMonsters] = useState([]);
  const [images, setImages] = useState([]);
  const [numColumns, setNumColumns] = useState(3);
  const [sortingMethod, setSortingMethod] = useState('id');
  const placeholders = Array.from({ length: (3 - monsters.length % 3) % 3 });

  const sortMonstersAndImages = async () => {
    // Pair each monster with its image
    const paired = monsters.map((monster, index) => ({ monster, image: images[index] }));

    // Sort the pairs
    if (sortingMethod === 'name') {
      paired.sort((a, b) => a.monster.name.localeCompare(b.monster.name));
    } else { // Default sort by ID
      paired.sort((a, b) => a.monster.id - b.monster.id);
    }

    // Separate the pairs back into monsters and images
    const sortedMonsters = paired.map(pair => pair.monster);
    const sortedImages = paired.map(pair => pair.image);

    setMonsters(sortedMonsters);
    setImages(sortedImages);

    // Save the sorting method to AsyncStorage
    try {
      await AsyncStorage.setItem('sortingMethod', sortingMethod);
    } catch (error) {
      console.error('Error saving sorting method to AsyncStorage:', error);
    }
  };

  /*
  useEffect(() => {
    // Retrieve the sorting method from AsyncStorage
    const getSortingMethod = async () => {
      try {
        const savedSortingMethod = await AsyncStorage.getItem('sortingMethod');
        if (savedSortingMethod) {
          setSortingMethod(savedSortingMethod);
        }
      } catch (error) {
        console.error('Error retrieving sorting method from AsyncStorage:', error);
      }
    };
    getSortingMethod(); // Call the function to retrieve the sorting method
    // Sort monsters and images when the sorting method changes
  sortMonstersAndImages();
}, [sortingMethod]);
*/


  useEffect(() => {
    sortMonstersAndImages();
  }, [sortingMethod]); // Re-sort whenever the sorting method changes


  const calculateNumColumns = () => {
    // Implement your logic to calculate the number of columns
    // For simplicity, I'm using a constant value here
    return 3;
  };

  useEffect(() => {
    // Update the number of columns dynamically based on your logic
    const updatedNumColumns = calculateNumColumns(); // Implement your logic to calculate the number of columns
    setNumColumns(updatedNumColumns);
  }, [/* Dependencies for the update, if any */]);

    // Use useFocusEffect to refresh monsters when the screen is focused
    useFocusEffect(
      React.useCallback(() => {
        refreshMonsters();
      }, [])
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
  const images = [];
  for (const monsterId of monsterIds) {
    const imageUrl = await fetchMonsterImageURL(monsterId);
    images.push(imageUrl);
  }
  return images;
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

    const monsterIds = sortedMonsters.map(monster => monster.id);
    const images = await getImages(monsterIds);

    setImages(images);
  } catch (error) {
    console.error('Error retrieving monsters from AsyncStorage:', error);
  }
};

return (
  <View style={styles.container}>
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
    <View style={styles.sortingContainer}>
  <TouchableOpacity onPress={() => setSortingMethod('id')}>
    <Icon name="sort" size={30} color="black" />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setSortingMethod('name')}>
    <Icon name="sort-by-alpha" size={30} color="black" />
  </TouchableOpacity>
</View>

      <View style={styles.contentContainer}>
        <Text style={styles.text}>My collected QReeps!</Text>
        <FlatList
          data={[...monsters, ...placeholders]}
          keyExtractor={(item, index) => `monster_${index}`}
          numColumns={numColumns}
          renderItem={({ item, index }) => (
          item ? (
          <View style={styles.monsterContainer}>
            {images[index] ? (
                <Image source={{ uri: images[index] }} style={styles.image} />
              ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="black" />
              </View>
              )}
            <Text style={styles.monsterName}>{item.name}</Text>
          </View>
        ) : (
        <View style={[styles.monsterContainer, styles.invisible]} />
        )
      )}
    />
      </View>
    </ImageBackground>
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
    width: '100%', // Set the image width to 100% to fit the container
    height: 120,
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
  sortingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
});

export default GalleryScreen;