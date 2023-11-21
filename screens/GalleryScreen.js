import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, FlatList, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const backgroundImage = require('../assets/images/horrible-monster-2.jpg');

const GalleryScreen = ({ navigation }) => {
  const [monsters, setMonsters] = useState([]);
  const [images, setImages] = useState([]);
  const [numColumns, setNumColumns] = useState(3);
  const [sortingMethod, setSortingMethod] = useState('id');
  const placeholders = Array.from({ length: (3 - monsters.length % 3) % 3 });

  const sortMonstersAndImages = () => {
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
  };

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

    // Function to refresh monsters when called
    const refreshMonsters = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const monstersData = await AsyncStorage.getItem(`monsters_${userId}`);
        const monsterImages = await AsyncStorage.getItem(`images_${userId}`);

        setMonsters(monstersData ? JSON.parse(monstersData) : []);
        setImages(monsterImages ? JSON.parse(monsterImages) : []);

        console.log('GALLERYSCREEN: imageURLs from AsyncStorage:', monsterImages);

        // Extract names from each monster and log only names
        const monsterNames = (monstersData ? JSON.parse(monstersData) : []).map(monster => monster.name);
        console.log('GALLERYSCREEN: Monster Names from AsyncStorage:', monsterNames);

      } catch (error) {
        console.error('Error retrieving monsters from AsyncStorage:', error);
      }
    };

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

// Function to find duplicate monsters and count their occurrences
const findDuplicates = (array) => {
  const counts = {};
  array.forEach((item) => {
    counts[item.id] = (counts[item.id] || 0) + 1;
  });
  return counts;
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
                <Image source={{ uri: images[index] }} style={styles.image} />
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
  // <Button title="Go to Home screen" onPress={() => navigation.navigate('Home')} /> 
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
  image: {
    width: '100%', // Set the image width to 100% to fit the container
    height: 200,
    marginBottom: 4,
    borderRadius: 20,
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