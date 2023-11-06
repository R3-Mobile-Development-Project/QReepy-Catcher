import * as React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
//import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { initializeApp } from "firebase/app";
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import { auth } from 'firebase/app';
//import 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();



export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Log In">
        <Stack.Screen name="Log In" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
