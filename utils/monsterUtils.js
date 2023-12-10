import { getFirestore, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function findMonster() {
  const randomNumber = Math.random() * 100;
  let foundMonsterId;

  if (randomNumber < 10) {
    // Epic monster
    foundMonsterId = Math.floor(Math.random() * 5) + 46; // ID:t 46-50
  } else if (randomNumber < 40) {
    // Rare monster
    foundMonsterId = Math.floor(Math.random() * 15) + 31; // ID:t 31-45
  } else if (randomNumber < 100) {
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

    // Update the user's progress towards the achievements
    const userProgress = await AsyncStorage.getItem(`userProgress_${userId}`);
    const parsedUserProgress = userProgress ? JSON.parse(userProgress) : {};

    const monsterId = monster.id;

    if (parsedUserProgress[monsterId]) {
      parsedUserProgress[monsterId]++;
    } else {
      parsedUserProgress[monsterId] = 1;
    }

    // Log the updated user progress
    console.log(`Updated user progress for monster ${monsterId}:`, parsedUserProgress[monsterId]);

    await AsyncStorage.setItem(`userProgress_${userId}`, JSON.stringify(parsedUserProgress));

    // Check if the user has achieved any of the achievements
    const newAchievements = await checkAchievements(userId);

    // Trigger the callback to update the component
    if (newAchievements.length > 0) {
      // If there are new achievements, display an alert
      const achievementMessage = `New Achievements: ${newAchievements.join(', ')}`;
      AchievementAlert.show(achievementMessage);
    }

    /*const newAchievement = await checkAchievement(monster.id, achievements);

    // Trigger the callback to update the component
    if (newAchievement) {
      // If there is a new achievement, display an alert
      console.log(`New Achievement Unlocked: ${newAchievement}`)
      //AchievementAlert.show(achievementMessage);
    }*/
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
        rarity: doc.data().rarity,
        age: doc.data().age,
        dominantColors: parsedColors, // Use default if parsing fails
      };

      // Save the monster to AsyncStorage
      saveMonsterToAsyncStorage(monsterObject, userId);
      console.log(`MONSTERUTILS: Saved monster to AsyncStorage: ${monsterObject.name} for user ID: ${userId}`);
      console.log(`MONSTERUTILS`);

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

export const fetchAchievements = async () => {
  try {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, 'achievements'));
    const achievements = [];

    querySnapshot.forEach((doc) => {
      const achievementData = doc.data();
      const achievement = {
        id: doc.id,
        name: achievementData.name,
        description: achievementData.description,
        trigger: achievementData.trigger,
      };

      achievements.push(achievement);
    });

    return achievements;
  } catch (error) {
    console.error('Error reading achievements from Firestore: ', error);
    throw error;
  }
};

const fetchMonsters = async (userId) => {
  try {
    const monsters = await AsyncStorage.getItem(`monsters_${userId}`);
    return JSON.parse(monsters) || [];
  } catch (error) {
    console.error('Error fetching monsters from AsyncStorage:', error);
    throw error;
  }
 };

export const checkAchievements = async (userId) => {
  try {
    // Retrieve user progress from AsyncStorage
    const userProgress = await AsyncStorage.getItem(`userProgress_${userId}`);
    const parsedUserProgress = userProgress ? JSON.parse(userProgress) : {};

    // Retrieve achievements from Firestore
    const achievements = await fetchAchievements();

    // Check each achievement
    achievements.forEach(async (achievement) => {
      const triggerType = achievement.trigger.type;
      const triggerCount = achievement.trigger.count;
      const triggerMonsterRange = achievement.trigger.monsterRange;
      const triggerSpecificMonsters = achievement.trigger.specificMonsters;

      // Implement different checks based on the trigger type
      switch (triggerType) {
        case 'collectCount':
          const collectedCount = calculateCollectedCount(parsedUserProgress, triggerMonsterRange);
          if (collectedCount >= triggerCount) {
            // Achievement unlocked
            console.log(`Achievement unlocked: ${achievement.name}`);
            // Add logic to notify the user or update UI as needed
          }
          break;

        case 'collectSpecific':
          const collectedSpecificCount = calculateCollectedSpecific(parsedUserProgress, triggerSpecificMonsters);
          if (collectedSpecificCount >= triggerCount) {
            // Achievement unlocked
            console.log(`Achievement unlocked: ${achievement.name}`);
            // Add logic to notify the user or update UI as needed
          }
          break;

        case 'collectAll':
          const collectedAllCount = calculateCollectedAll(parsedUserProgress, triggerMonsterRange);
          //console.log(`Collected all count: ${collectedAllCount}`);
          if (collectedAllCount >= triggerCount) {
            // Achievement unlocked
            console.log(`Achievement unlocked: ${achievement.name}`);
            // Add logic to notify the user or update UI as needed
          }
          break;

        case 'firstCatch':
          const hasCaughtFirstMonster = calculateFirstCatch(parsedUserProgress, triggerMonsterRange);
          if (hasCaughtFirstMonster) {
            // Achievement unlocked
            console.log(`Achievement unlocked: ${achievement.name}`);
            // Add logic to notify the user or update UI as needed
          }
          break;

        // Add more cases for other trigger types if needed

        default:
          break;
      }
    });
    return [];
  } catch (error) {
    console.error('Error checking achievements:', error);
    //return []; // Return an empty array in case of an error
  }
};

const calculateCollectedCount = async (userId, monsterRange) => {
  let collectedCount = 0;
  const monsters = await fetchMonsters(userId);
 
  for (let i = monsterRange[0]; i <= monsterRange[1]; i++) {
    const monsterId = i.toString();
    if (monsters.includes(monsterId)) {
      collectedCount += userProgress[monsterId] || 0;
    }
  }
 
  return collectedCount;
 };

// Updated calculateCollectedSpecific function to use uniqueMonsterIds set
const calculateCollectedSpecific = async (userId, specificMonsters) => {
  let collectedSpecificCount = 0;
  const monsters = await fetchMonsters(userId);
 
  specificMonsters.forEach((monsterId) => {
    const stringMonsterId = monsterId.toString();
    if (monsters.includes(stringMonsterId)) {
      collectedSpecificCount += userProgress[stringMonsterId] || 0;
    }
  });
 
  return collectedSpecificCount;
 };

 const calculateCollectedAll = async (userId, monsterRange) => {
  const monsters = await fetchMonsters(userId);
 
  for (let i = monsterRange[0]; i <= monsterRange[1]; i++) {
    const monsterId = i.toString();
    //console.log(`Monster ID: ${monsterId}`);
    if (!monsters.includes(monsterId) || userProgress[monsterId] < 1) {
      return 0; // Not all monsters in the range are collected
    }
  }
 
  return 1; // All monsters in the range are collected
 };

// Updated calculateFirstCatch function to use uniqueMonsterIds set
const calculateFirstCatch = (userProgress, monsterRange) => {
  for (let i = monsterRange[0]; i <= monsterRange[1]; i++) {
    const monsterId = i.toString();
    if (userProgress[monsterId] && userProgress[monsterId] > 0) {
      return true; // User has caught at least one monster in the range
    }
  }

  return false; // User has not caught any monster in the range
};
/*export const checkAchievements = async (userId) => {
  try {
   // Fetch the user's progress from AsyncStorage
   const userProgressString = await AsyncStorage.getItem(`userProgress_${userId}`);
   const userProgress = userProgressString ? JSON.parse(userProgressString) : {};
 
   // Fetch the achievements from Firestore
   const achievements = await fetchAchievements();
 
   // Check if the user has achieved any of the achievements
   achievements.forEach(achievement => {
     if (achievement.trigger.type === "firstCatch") {
       // Check if the user has caught any monster within the specified range
       const hasCaughtAnyMonster = Object.keys(userProgress)
         .some(monsterId => achievement.trigger.monsterRange.includes(Number(monsterId)));
 
       if (hasCaughtAnyMonster) {
         console.log(`User has achieved: ${achievement.name}`);
       }
     } else if (achievement.trigger.type === "collectCount") {
       // Existing code...
     }
     else if (achievement.trigger.type === "collectSpecific") {
      // Check if the user has caught all specific monsters
      const hasCaughtAllSpecificMonsters = achievement.trigger.specificMonsters.every(
        monsterId => userProgress[monsterId]
      );
     
      if (hasCaughtAllSpecificMonsters) {
        console.log(`User has achieved: ${achievement.name}`);
      }
     }
     else if (achievement.trigger.type === "collectAll") {
      // Check if the user has caught all monsters within the range
      const hasCaughtAllMonstersInRange = achievement.trigger.monsterRange.every(
        monsterId => userProgress[monsterId] === true
       );
     
      if (hasCaughtAllMonstersInRange) {
        console.log(`User has achieved: ${achievement.name}`);
      }
     }
   });
  } catch (error) {
   console.error('Error checking achievements:', error);
   throw error;
  }
 };*/