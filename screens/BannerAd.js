import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Linking } from 'react-native';


const ads = [
  {
    text: "Life's too short to drink water! Grab a glass of fine whiskey and start turning your ordinary moments into extraordinary memories. Remember, whiskey may not solve all your problems, but it's worth a shot (or two)!😄🥃" ,
    url: 'https://en.wikipedia.org/wiki/Alcoholism',
    displayDuration: 24000, // e.g., 26 seconds
    backgroundColor: '#E38200', // Example color
    
  },
  {
    text: "Finnair: Where the only thing we take more seriously than your safety is our ability to lose your luggage with a smile!✈️"    ,
    url: 'https://www.finnair.com/fi-en',
    displayDuration: 14000, // e.g., 13 seconds
    backgroundColor: '#add8e6', // Another example color

  },
  {
    text: "Listen to this masterpiece while you're at it!🎶" ,
    url: 'https://www.youtube.com/watch?v=Dc6pAuRiyVo&t=4s',
    displayDuration: 8000, // e.g., 10 seconds
    backgroundColor: '#FF0000', // Example color
    
  },
  // Add more ads with their durations as needed
];

const BannerAd = () => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const animatedValue = new Animated.Value(0);

  const animateBannerAd = () => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 26000, // Fixed duration for scrolling speed
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    animateBannerAd();
    const interval = setTimeout(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, ads[currentAdIndex].displayDuration); // Use the duration from the ad data

    return () => clearTimeout(interval);
  }, [currentAdIndex]);

  const openURL = () => {
    const url = ads[currentAdIndex].url;
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  };

  return (
    <View style={[styles.adContainer, { backgroundColor: ads[currentAdIndex].backgroundColor }]}>
    <TouchableOpacity onPress={() => openURL(ads[currentAdIndex].url)}>
      <Animated.View
          style={[
            styles.adContent,
            {
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, -3350], // Adjust as needed to accommodate the longest text
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.adText}>
            {ads[currentAdIndex].text}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  adContainer: {
    height: 50, // Adjust the height to your desired value
    backgroundColor: 'lightgray',
    overflow: 'hidden',
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  adText: {
    fontSize: 30,
    fontWeight: 'bold',
    fontStyle: 'italic',
    width: '1000%', // Set a very wide width to ensure text flows horizontally
  },
});

export default BannerAd;