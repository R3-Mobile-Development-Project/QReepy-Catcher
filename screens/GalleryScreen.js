import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const backgroundImage = require('../assets/images/horrible-monster-2.jpg');

const GalleryScreen = ({ navigation }) => {
  const [monsters, setMonsters] = useState([]);

    // Function to refresh monsters when called
    const refreshMonsters = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const monstersData = await AsyncStorage.getItem(`monsters_${userId}`);
        setMonsters(monstersData ? JSON.parse(monstersData) : []);
        console.log('Monsters from AsyncStorage:', monstersData ? JSON.parse(monstersData) : []);
      } catch (error) {
        console.error('Error retrieving monsters from AsyncStorage:', error);
      }
    };

    /*
    useEffect(() => {
      // Log monsters when the component mounts
      refreshMonsters();
    }, []);
  */

    // Use useFocusEffect to refresh monsters when the screen is focused
    useFocusEffect(
      React.useCallback(() => {
        refreshMonsters();
      }, [])
    );


  /*
  useEffect(() => {
    const logMonsters = async () => {
      try {
        // Retrieve userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');

        if (!userId) {
          console.error('No userId found in AsyncStorage');
          return;
        }

        // Retrieve monsters for the user from AsyncStorage
        const monstersData = await AsyncStorage.getItem(`monsters_${userId}`);
        setMonsters(monstersData ? JSON.parse(monstersData) : []);
        console.log('Monsters from AsyncStorage:', monstersData ? JSON.parse(monstersData) : []);
      } catch (error) {
        console.error('Error retrieving monsters from AsyncStorage:', error);
      }
    };

    // Log monsters when the component mounts
    logMonsters();
  }, []);
  */

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>
          <Text style={styles.text}>Welcome to the Gallery!</Text>
          <FlatList
            data={monsters}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.monsterContainer}>
        {/*        <Image source={{ uri: item.imageUri }} style={styles.image} /> */}
                <Text style={styles.monsterText}>Name: {item.name}</Text>
        {/*        <Text style={styles.monsterText}>Title: {item.title}</Text>  */}
        {/*      <Text style={styles.monsterText}>Dominant Colors: {item.dominantColors.join(', ')}</Text> */}
              </View>
            )}
          />
          <Button
            title="Go to Home screen"
            onPress={() => navigation.navigate('Home')}
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
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  monsterText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GalleryScreen;
