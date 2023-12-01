// AdPlaceholder.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdPlaceholder = () => {
  return (
    <View style={styles.adContainer}>
      <Text style={styles.adText}>Ad Placeholder</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    height: 100, // Adjust the height as needed
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // Add margin between ad placeholders if needed
  },
  adText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdPlaceholder;
