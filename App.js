import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, StatusBar, AppRegistry } from 'react-native';
//import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { getAuth } from 'firebase/auth'; // Import Firebase authentication methods
import { initializeApp } from "firebase/app";
import 'firebase/auth';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import { auth } from 'firebase/app';
//import 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';
import MonsterInfoModal from './modals/MonsterInfoModal';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import ScanningScreen from './screens/ScanningScreen';
import SplashScreen from './screens/SplashScreen';
import GalleryScreen from './screens/GalleryScreen';
import { MusicProvider } from './MusicContext'; // Import MusicProvider from MusicContext
import BannerAd from './screens/BannerAd'; // Import the BannerAd component

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false); // Initialize user state variable
  const [showSplash, setShowSplash] = useState(true); // State to control whether to show the SplashScreen

  useEffect(() => {
    // Check if user is logged in or not
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is logged in
        setUserLoggedIn(true);
      } else {
        // User is not logged in
        setUserLoggedIn(false);
      }
    });
    // Detach listener
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Simulate loading or any async tasks
    setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Adjust the duration of the SplashScreen as needed
  }, []);

  return (

    <NavigationContainer>
        <MusicProvider>

      <StatusBar style="auto" />
      {showSplash ? (
        <SplashScreen />
      ) : userLoggedIn ? (
        <Tab.Navigator
          initialRouteName="Home"
          tabBarPosition="bottom"
          screenOptions={({ route }) => ({
            tabBarLabel: ({ focused, color }) => {
              let labelName;

              if (route.name === 'Home') {
                labelName = 'HOME';
              } else if (route.name === 'Profile') {
                labelName = 'PROFILE';
              } else if (route.name === 'Scanner') {
                labelName = 'SCANNER';
              } else if (route.name === 'Gallery') {
                labelName = 'COLLECTION';
              }

              return (
                <Text style={{ color, fontSize: 13, fontWeight: 'bold', marginBottom: 3 }}>
                  {labelName}
                </Text>
              );
            },
            tabBarStyle: {
              display: 'flex',
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline'; // Use home and home-outline for the Home tab
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline'; // Use person and person-outline for the Profile tab
              } else if (route.name === 'Scanner') {
                iconName = focused ? 'scan' : 'scan-outline'; // Use scan and scan-outline for the Scanner tab
              } else if (route.name === 'Gallery') {
                iconName = focused ? 'image' : 'image-outline'; // Use image and image-outline for the Gallery tab
              }

              return (
                <View style={{ alignItems: 'center', marginBottom: -30 }}>
                  <Ionicons name={iconName} size={25} color={color} />
                  <Text style={{ color, marginTop: 5 }}></Text>
                </View>
              );
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Scanner" component={ScanningScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Gallery" component={GalleryScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          {/* Add other tab screens as needed */}
        </Tab.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={AuthScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
        </MusicProvider>
        <BannerAd />

    </NavigationContainer>
 

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
  },
});
