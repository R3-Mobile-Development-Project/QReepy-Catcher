import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'; // Import Firebase authentication methods
import firebase from 'firebase/app';
import { auth } from 'firebase/app';
import 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSound } from '../utils/SoundContext'; // Import useSound hook

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Initialize error state variable
  const [loading, setLoading] = useState(false); // Add loading state variable
  const [userLoggedIn, setUserLoggedIn] = useState(false); // Initialize user state variable
  const [userId, setUserId] = useState(null);
  const { areSoundsMuted } = useSound(); // Use the useSound hook

  const backgroundImage = require('../assets/images/happy-monster-friends-border-banner_1308-158224.jpg');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid;
    //    console.log('User ID:', userId);
        setUserId(userId);
      } else {
      //  console.error('No user found after login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Updated playSuccessSound function
  const playSuccessSound = async () => {
    if (!areSoundsMuted) {
      const successSound = new Audio.Sound();
      try {
        const successSource = require('../assets/sounds/exit_TOIMII.wav');
        await successSound.loadAsync(successSource);
        await successSound.playAsync();
        setTimeout(async () => {
          await successSound.unloadAsync();
        }, 1000);
      } catch (error) {
        console.error('Error with success sound:', error);
      }
    }
  };

  // Updated playErrorSound function
  const playErrorSound = async () => {
    if (!areSoundsMuted) {
      const errorSound = new Audio.Sound();
      try {
        const errorSource = require('../assets/sounds/ALERT_Error_TOIMII.wav');
        await errorSound.loadAsync(errorSource);
        await errorSound.playAsync();
        setTimeout(async () => {
          await errorSound.unloadAsync();
        }, 450);
      } catch (error) {
        console.error('Error with error sound:', error);
      }
    }
  };

  // Updated playButtonSound function
  const playButtonSound = async () => {
    if (!areSoundsMuted) {
      const buttonSound = new Audio.Sound();
      try {
        const buttonSource = require('../assets/sounds/Menu_Selection_Click.wav');
        await buttonSound.loadAsync(buttonSource);
        await buttonSound.playAsync();
        setTimeout(async () => {
          await buttonSound.unloadAsync();
        }, 500);
      } catch (error) {
        console.error('Error with button sound:', error);
      }
    }
  };


  const handleSignup = async () => {
    try {
      playButtonSound(); // Play button sound on signup button press
      setLoading(true); // Set loading to true when signup is initiated
      // Initialize Firebase auth
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      // Once signup is successful, navigate to HomeScreen or perform other actions

      // Get the currently signed-in user
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
     //   console.log('User ID:', userId);

        // Save the userId to AsyncStorage
        await AsyncStorage.setItem('userId', userId);
        // Now, retrieve the value and log it
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('Stored User ID:', storedUserId);
      } else {
        console.error('No user found after login');
      }

      playSuccessSound(); // Play success sound on signup success
      setEmail('');
      setPassword('');
      setError(null); // Reset error
    //  navigation.navigate('Home');
    } catch (error) {
      // Handle signup error
      playErrorSound(); // Play error sound on signup failure
      setEmail('');
      setPassword('');
  //    setError(error.message); // Update error message
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/email-already-in-use':
          setError('The email address is already in use.\n Please use a different email.');
          break;
        case 'auth/missing-email':
          setError('Email field cannot be empty.');
        break;
        case 'auth/missing-password':
          setError('Password field cannot be empty.');
        break;
        case 'auth/weak-password':
          setError('Password has to be atleast 6 characters.');
        break;
        default:
          setError('Signup failed. Please try again.');
          break;
      }
      console.error(error.message);
    } finally {
      setLoading(false); // Set loading to false when signup is completed
    }
  };

  const handleLogin = async () => {
    try {
      playButtonSound(); // Play button sound on login button press
      setLoading(true); // Set loading to true when signup is initiated
      // Initialize Firebase auth
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);

      // Get the currently signed-in user
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
     //   console.log('User ID:', userId);

        // Save the userId to AsyncStorage
        await AsyncStorage.setItem('userId', userId);
        // Now, retrieve the value and log it
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('Stored User ID:', storedUserId);
      } else {
        console.error('No user found after login');
      }

      // Once login is successful, navigate to HomeScreen or perform other actions
      playSuccessSound(); // Play success sound on login success
      setUserLoggedIn(true);
      setEmail('');
      setPassword('');
      setError(null); // Reset error
  //    navigation.navigate('Home');
      console.log("Login successful!");
    } catch (error) {
      // Handle login error
      playErrorSound(); // Play error sound on signup failure
      setPassword('');
  //    setError(error.message); // Update error message
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address.');
        break;
        case 'auth/invalid-login-credentials':
          setError('Invalid login credentials. Please try again.');
        break;
        case 'auth/missing-email':
          setError('Email field cannot be empty.');
        break;
        case 'auth/missing-password':
          setError('Password field cannot be empty.');
        break;
        default:
          setError('Signup failed. Please try again.');
        break;
      }
      console.error(error.message);
    } finally {
      setLoading(false); // Set loading to false when signup is completed
    }
  };

  // Function to handle changes in email or password inputs
  const handleInputChange = () => {
    setError(null); // Reset error when input changes
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on the platform
      style={styles.container}
    >
      <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="stretch"
    >
      <View style={styles.contentContainer}>
      <Text style={styles.text}>Welcome, please log in or create an account!</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
        onChange={handleInputChange} // Handle input change
        autoCapitalize="none" // Disable auto-capitalization
        keyboardType="email-address" // Set keyboard type for email input
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        style={styles.input}
        onChange={handleInputChange} // Handle input change
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={handleLogin}
          disabled={loading} // Disable the button when loading is true
        >
          {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
          <Text style={styles.buttonText}>LOG IN</Text>
          <MaterialIcons name="login" size={24} color="white" />
                </>
              )}
        </TouchableOpacity>
        <Text> Don't have an account yet? </Text>
        <Text> Fill in the fields and sign up! </Text>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={handleSignup}
          disabled={loading} // Disable the button when loading is true
        >
          {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
          <Text style={styles.buttonText}>SIGN UP</Text>
          <MaterialIcons name="person-add" size={24} color="white" />
                </>
              )}
        </TouchableOpacity>
      </View>
      </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'right',
    alignItems: 'right',
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  input: {
    width: '70%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    marginVertical: 8,
    paddingLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.7)'
  },
  errorText: {
    color: 'red', // Set error text color
    marginBottom: 10, // Add some spacing
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
  },
  button: {
    flexDirection: 'row',
    width: '40%',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    paddingRight: 10,
  },
  loginButton: {
    backgroundColor: 'blue',
  },
  signupButton: {
    backgroundColor: 'green',
  },
});

export default AuthScreen;
