import { getFirestore, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { Alert } from 'react-native';
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
  //  await AsyncStorage.setItem(`caughtMonsters_${userId}`, parsedExistingMonsters.length.toString());
  //  console.log(`MONSTERUTILS: ${parsedExistingMonsters.length.toString()} monsters caught for user ID: ${userId}`);
  //  console.log(`MONSTERUTILS 1: Saved monster to AsyncStorage: ${monster.name} for user ID: ${userId}`);

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

   console.log("this  is newAchievements!!!",newAchievements)

   // Display an alert if there are new achievements
   displayAchievementAlert(userId, newAchievements);

    // Trigger the callback to update the component
  } catch (error) {
    console.error('Error saving monster to AsyncStorage:', error);
    throw error;
  }
};

// ACHIEVEMENT ALERT
export const displayAchievementAlert = async (userId, newAchievements) => {
  if (newAchievements.length > 0) {
    const displayedAchievements = await AsyncStorage.getItem(`displayedAchievements_${userId}`);
    const parsedDisplayedAchievements = displayedAchievements ? JSON.parse(displayedAchievements) : [];

    const undiscoveredAchievements = newAchievements.filter(achievement => !parsedDisplayedAchievements.includes(achievement));

    if (undiscoveredAchievements.length > 0) {
      const achievementMessage = `New Achievements: ${undiscoveredAchievements.join(', ')}`;
      console.log('Displaying Alert:', achievementMessage);
      Alert.alert('Achievement Unlocked', achievementMessage);
      console.log('Alert Displayed');

      // the already displayed function moved to displayedAchievements asyncstorage
      const updatedDisplayedAchievements = [...parsedDisplayedAchievements, ...undiscoveredAchievements];
      await AsyncStorage.setItem(`displayedAchievements_${userId}`, JSON.stringify(updatedDisplayedAchievements));

      console.log('Updated Displayed Achievements:', updatedDisplayedAchievements);
    }
  }
};

export const getUpdatedDisplayedAchievements = async (userId) => {
  try {
    const displayedAchievements = await AsyncStorage.getItem(`displayedAchievements_${userId}`);
    const parsedDisplayedAchievements = displayedAchievements ? JSON.parse(displayedAchievements) : [];
    return parsedDisplayedAchievements;
  } catch (error) {
    console.error('Error fetching updatedDisplayedAchievements:', error);
    throw error;
  }
};

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

export const fetchAchievements = async (triggerType) => {
  try {
   const db = getFirestore();
   const querySnapshot = await getDocs(collection(db, 'achievements'));
   const achievements = [];
 
   querySnapshot.forEach((doc) => {
     const achievementData = doc.data();
     if (achievementData.trigger.type === triggerType) {
       const achievement = {
         id: doc.id,
         name: achievementData.name,
         description: achievementData.description,
         trigger: achievementData.trigger,
       };
 
       achievements.push(achievement);
     }
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
    //console.log(`Checking achievements for user ${userId}`);
    // Retrieve user progress from AsyncStorage
    const userProgress = await AsyncStorage.getItem(`userProgress_${userId}`);
    const parsedUserProgress = userProgress ? JSON.parse(userProgress) : {};
 
    // Define the trigger types
  const triggerTypes = ['firstCatch', 'collectAll', 'collectSpecific', 'collectCount'];

  // Retrieve achievements for each trigger type
  const allAchievements = [];
  for (let i = 0; i < triggerTypes.length; i++) {
    const achievements = await fetchAchievements(triggerTypes[i]);
    allAchievements.push(...achievements);
  }
  //console.log(allAchievements);

  const newAchievements = [];

  // Check each achievement
  for (let i = 0; i < allAchievements.length; i++) {
    console.log(`Checking achievement: ${allAchievements[i].name}`);

    const achievement = allAchievements[i];
    const triggerType = achievement.trigger.type;
    const triggerCount = achievement.trigger.count;
    const triggerMonsterRange = achievement.trigger.monsterRange;
    const triggerSpecificMonsters = achievement.trigger.specificMonsters;

    //console.log(achievement)

            switch (triggerType) {
            case 'collectCount':
              if (triggerMonsterRange.length > 0) {
                const collectedCount = await calculateCollectedCount(userId, parsedUserProgress, triggerMonsterRange);
                console.log(`Collected count for user ${userId}: ${collectedCount}`);
                console.log("case collect count", parsedUserProgress, "and triggerMonsterRange", triggerMonsterRange)
     
                if (collectedCount >= triggerCount) {
                  // Achievement unlocked
                  console.log(`Achievement unlocked: ${achievement.name}`);
                  newAchievements.push(achievement.name);
                  }
              }
              break;
                
          case 'collectAll':
              if (triggerMonsterRange.length > 0) {
                 const collectedCount = await calculateCollectedAll(userId, parsedUserProgress, triggerMonsterRange);
                console.log(`Collected count for user in collect all ${userId}: ${collectedCount}`);
                console.log("case collect count in collect all", parsedUserProgress, "and triggerMonsterRange", triggerMonsterRange)
       
                  if (collectedCount >= triggerCount) {
                    // Achievement unlocked
                    console.log(`Achievement unlocked: ${achievement.name}`);
                    newAchievements.push(achievement.name)
                  }
                }
                break;

 
        case 'firstCatch':
          const hasCaughtFirstMonster = calculateFirstCatch(parsedUserProgress, triggerMonsterRange);
          if (hasCaughtFirstMonster) {
            // Achievement unlocked
            console.log(`Achievement unlocked: ${achievement.name}`);
            newAchievements.push(achievement.name);
            
          }
          break;
 
        default:
          break;
      }
    }
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return []; // Return an empty array in case of an error
  }
 };

const calculateCollectedCount = async (userId, userProgress, monsterRange) => {
  console.log("monster range in collected count", monsterRange)
  console.log(`User ID: ${userId}`);
  let collectedCount = 0;
 
  for (let i = monsterRange[0]; i <= monsterRange[1]; i++) {
    const monsterId = i.toString();
    collectedCount += userProgress[monsterId] || 0;
  }
  console.log(`Collected count for user ${userId}: ${collectedCount}`);
  return collectedCount;
 };


 const calculateCollectedAll = async (userId, userProgress, monsterRange) => {
  try {
    console.log("monster range in collected all", monsterRange);
    console.log(`User ID: ${userId}`);
    let collectedCount = 0;

    for (let i = monsterRange[0]; i <= monsterRange[1]; i++) {
      const monsterId = i.toString();

      // Check if the monster exists in userProgress and if it is collected
      collectedCount += userProgress[monsterId] || 0;
    }

    console.log(`Collected count for user ${userId}: ${collectedCount}`);
    return collectedCount; // Return the total collected count
  } catch (error) {
    console.error('Error calculating collected monsters:', error);
    throw error;
  }
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
