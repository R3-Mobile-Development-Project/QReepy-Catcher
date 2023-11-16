import { getFirestore, collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

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

export const fetchMonsterDetails = async (monsterId) => {
  const db = getFirestore();
  const q = query(collection(db, 'monsters'), where('id', '==', monsterId));

  try {
    const querySnapshot = await getDocs(q);
    const tempMonsters = [];

    querySnapshot.forEach((doc) => {
      const monsterObject = {
        name: doc.data().name,
        title: doc.data().title,
      };
      tempMonsters.push(monsterObject);
    });

    return tempMonsters;
  } catch (error) {
    console.error('Error reading monsters from Firestore: ', error);
    throw error;
  }
};

export const fetchMonsterImageURL = async (monsterId) => {
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
