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

    console.log('Saved monster:', monster.name, 'for user ID:', userId);
    // Trigger the callback to update the component
  } catch (error) {
    console.error('Error saving monster to AsyncStorage:', error);
    throw error;
  }
};
/*
export const fetchMonsterDetails = async (monsterId) => {
  try {
    // Retrieve userId from AsyncStorage
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      console.error('No userId found in AsyncStorage');
      return;
    }

    // Call fetchMonsterDetails with the retrieved userId
  //  const monsters = await fetchMonsterDetailsFromFirestore(monsterId, userId);

    // Continue with the rest of your code using the retrieved monsters
    // ...

  } catch (error) {
    console.error('Error retrieving userId from AsyncStorage:', error);
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
        name: doc.data().name,
        title: doc.data().title,
        dominantColors: parsedColors, // Use default if parsing fails
      };

      // Save the monster to AsyncStorage
      saveMonsterToAsyncStorage(monsterObject, userId);
      console.log(`Saved monster to AsyncStorage: ${monsterObject.name} for user ID: ${userId}`);

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
  const storage = getStorage();
  const imageRef = ref(storage, `gs://qreepy-catcher.appspot.com/Monsters/${monsterId}.jpg`);

  try {
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error('Error fetching monster image URL: ', error);
    throw error;
  }
};
