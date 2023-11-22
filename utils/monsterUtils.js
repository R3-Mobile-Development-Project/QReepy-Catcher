import { getFirestore, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const findMonster = () => {
  const randomNumber = Math.random() * 100;
  let foundMonsterId;

  if (randomNumber < 2) {
    // Epic monster
    foundMonsterId = Math.floor(Math.random() * 5) + 46; // ID:t 46-50
  } else if (randomNumber < 10) {
    // Rare monster
    foundMonsterId = Math.floor(Math.random() * 15) + 31; // ID:t 31-45
  } else if (randomNumber < 40) {
    // Common monster
    foundMonsterId = Math.floor(Math.random() * 30) + 1; // ID:t 1-30
  }

  return foundMonsterId;
};

export const saveMonsterToAsyncStorage = async (monster, userId) => {
  try {
    // Get existing monsters for the user from AsyncStorage
    const existingMonsters = await AsyncStorage.getItem(`monsters_${userId}`);

    // Parse existing monsters or initialize an empty array
    const parsedExistingMonsters = existingMonsters ? JSON.parse(existingMonsters) : [];

    // Add the new monster to the array
    parsedExistingMonsters.push(monster);

    // Save the updated monsters array to AsyncStorage
    await AsyncStorage.setItem(`monsters_${userId}`, JSON.stringify(parsedExistingMonsters));
  //  console.log(`MONSTERUTILS 1: Saved monster to AsyncStorage: ${monster.name} for user ID: ${userId}`);

    // Trigger the callback to update the component
  } catch (error) {
    console.error('Error saving monster to AsyncStorage:', error);
    throw error;
  }
};

/*
export const saveImageToAsyncStorage = async (imageUrl, userId) => {
  try {
    // Get existing images for the user from AsyncStorage
    const existingImages = await AsyncStorage.getItem(`images_${userId}`);

    // Parse existing images or initialize an empty array
    const parsedExistingImages = existingImages ? JSON.parse(existingImages) : [];

    // Add the new image URL to the array
    parsedExistingImages.push(imageUrl);

    // Save the updated images array to AsyncStorage
    await AsyncStorage.setItem(`images_${userId}`, JSON.stringify(parsedExistingImages));

//  console.log('Saved image URL:', imageUrl, 'for user ID:', userId);
  } catch (error) {
    console.error('Error saving image to AsyncStorage:', error);
    throw error;
  }
 };
*/

export const fetchMonsterDetailsFromFirestore = async (monsterId, userId) => {
  try {
    // Retrieve userId from AsyncStorage
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      console.error('No userId found in AsyncStorage');
      return;
    }

  const db = getFirestore();
  const q = query(collection(db, 'monsters'), where('id', '==', monsterId));

    const querySnapshot = await getDocs(q);
    const tempMonsters = [];

    querySnapshot.forEach((doc) => {
      // Get the dominantColors array from the document
      const dominantColors = doc.data().dominantColors;

      // Parse the RGB values within parentheses
      const parseColors = (colorString) => {
        try {
          const rgbValues = colorString.match(/\(([^)]+)\)/);

          if (rgbValues && rgbValues[1]) {
            const parsedColors = rgbValues[1].split(',').map((value) => parseInt(value.trim(), 10));
            return parsedColors;

          } else {
            console.error('Invalid color string format:', colorString);
            return null;
          }
        } catch (error) {
          console.error('Error parsing colors:', error);
          return null;
        }
      };

      // Randomly select an index (0, 1, or 2)
      const randomIndex = Math.floor(Math.random() * 3);

      // Get the color string for the selected index
      const colorString = dominantColors[randomIndex];

      // Parse the color string to get the RGB values
      const parsedColors = parseColors(colorString);

      const monsterObject = {
        id: doc.data().id,
        name: doc.data().name,
        title: doc.data().title,
        nature: doc.data().nature,
        background: doc.data().background,
        age: doc.data().age,
        dominantColors: parsedColors, // Use default if parsing fails
      };

      // Save the monster to AsyncStorage
      saveMonsterToAsyncStorage(monsterObject, userId);
      console.log(`MONSTERUTILS: Saved monster to AsyncStorage: ${monsterObject.name} for user ID: ${userId}`);

    //  console.log(monsterObject);
      tempMonsters.push(monsterObject);

    });

    return tempMonsters;
  } catch (error) {
    console.error('Error reading monsters from Firestore: ', error);
    throw error;
  }
};

export const fetchMonsterImageURL = async (monsterId, userId) => {
  try {
    // Retrieve userId from AsyncStorage
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      console.error('No userId found in AsyncStorage');
      return;
    }
  const storage = getStorage();
  const imageRef = ref(storage, `gs://qreepy-catcher.appspot.com/Monsters/${monsterId}.jpg`);


    const url = await getDownloadURL(imageRef);
    /*
    // Save the image URL to AsyncStorage
    saveImageToAsyncStorage(url, userId);
    console.log(`MONSTERUTILS: Saved image URL to AsyncStorage: ${url} for user ID: ${userId}`);
    */

    return url;
  } catch (error) {
    console.error('Error fetching monster image URL: ', error);
    throw error;
  }
};
