import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing,TouchableOpacity,Linking } from 'react-native';

const BannerAd = () => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    animateBannerAd();
  }, []);

  const animateBannerAd = () => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 26000, // Adjust duration as needed
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(animateBannerAd, 1000); // Delay before restart
    });
  };
  const openURL = () => {
    Linking.openURL('https://fi.wikipedia.org/wiki/Alkoholismi')
      .catch(err => console.error('An error occurred', err));
  };
  


  return (
    <View style={styles.adContainer}>
          <TouchableOpacity onPress={openURL}>

      <Animated.View
        style={[
          styles.adContent,
          {
            transform: [
              {
                translateX: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, -3350], // Adjust based on actual text and container width
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.adText}>
          "Life's too short to drink water! Grab a glass of fine whiskey and start turning your ordinary moments into extraordinary memories. Remember, whiskey may not solve all your problems, but it's worth a shot (or two)!" 😄🥃
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
    fontSize: 34,
    fontWeight: 'bold',
    width: '1000%', // Set a very wide width to ensure text flows horizontally
  },
});

export default BannerAd;
