import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase authentication methods
import firebase from 'firebase/app';
import { auth } from 'firebase/app';
import 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Initialize error state variable

  const handleSignup = async () => {
    try {
      // Initialize Firebase auth
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      // Once signup is successful, navigate to HomeScreen or perform other actions
      setEmail('');
      setPassword('');
      setError(null); // Reset error
      navigation.navigate('Home');
    } catch (error) {
      // Handle signup error
      setEmail('');
      setPassword('');
      setError(error.message); // Update error message
      console.error(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      // Initialize Firebase auth
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // Once login is successful, navigate to HomeScreen or perform other actions
      setEmail('');
      setPassword('');
      setError(null); // Reset error
      navigation.navigate('Home');
      console.log("Login successful!");
    } catch (error) {
      // Handle login error
      setPassword('');
      setError(error.message); // Update error message
      console.error(error.message);
    }
  };

  // Function to handle changes in email or password inputs
  const handleInputChange = () => {
    setError(null); // Reset error when input changes
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, please log in or create an account!</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
        onChange={handleInputChange} // Handle input change
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
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Text> Don't have an account yet?</Text>
        <Text> Sign up from the button below!</Text>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={handleSignup}
        >
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 8,
    paddingLeft: 10,
  },
  errorText: {
    color: 'red', // Set error text color
    marginBottom: 10, // Add some spacing
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
  },
  button: {
    width: '48%',
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
  },
  loginButton: {
    backgroundColor: 'blue',
  },
  signupButton: {
    backgroundColor: 'green',
  },
});

export default AuthScreen;
