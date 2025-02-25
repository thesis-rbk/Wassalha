import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

// Complete any pending auth session (needed for web-like flows)
WebBrowser.maybeCompleteAuthSession();

const Signup = () => {
    const API=process.env.API_URL
    const router = useRouter(); // For navigation
  // State for email/password signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Google auth setup
//   const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
//     clientId: 'your-web-client-id.apps.googleusercontent.com', // Web Client ID for Expo Go
//     androidClientId: 'your-android-client-id.apps.googleusercontent.com', // For standalone Android
//     // iosClientId: 'your-ios-client-id.apps.googleusercontent.com', // Uncomment for iOS
//   });

  // Handle Google auth response
//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { id_token } = response.params;
//       handleGoogleSignup(id_token);
//     } else if (response?.type === 'error') {
//       Alert.alert('Error', 'Google signup failed. Please try again.');
//     }
//   }, [response]);

//   Email/password signup
  const handleEmailSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
      console.log("hello",name,email,password)
    try {
      const res = await fetch(`${API}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Store JWT and navigate to home screen
        await AsyncStorage.setItem('jwtToken', data.token || ''); // Adjust if token is returned
        Alert.alert('Success', 'Signup successful!');
        router.push('/login'); // Adjust to your navigation route
      } else {
        Alert.alert('Error', data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

//   // Google signup/login
//   const handleGoogleSignup = async (idToken) => {
//     try {
//       const res = await fetch('http://your-api-url/api/google-login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ idToken }),
//       });
//       const data = await res.json();

//       if (res.ok) {
//         // Store JWT and navigate to home screen
//         await AsyncStorage.setItem('jwtToken', data.token);
//         Alert.alert('Success', 'Google signup successful!');
//         navigation.navigate('Home'); // Adjust to your navigation route
//       } else {
//         Alert.alert('Error', data.error || 'Google signup failed');
//       }
//     } catch (error) {
//       console.error('Google signup error:', error);
//       Alert.alert('Error', 'Something went wrong');
//     }
//   };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* Email/Password Form */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up with Email" onPress={()=>handleEmailSignup()} />

      {/* Google Signup Button */}
      <View style={styles.googleButton}>
        <Button
          title="Sign Up with Google"
          onPress={() => +console.log("hello")} // Adjust to your Google auth function
           // Disable until Google auth is ready
        />
      </View>

      {/* Link to Login */}
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text
          style={styles.loginLink}
          onPress={() =>router.push('/login')} // Adjust to your navigation route
        >
          Log In
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  googleButton: {
    marginTop: 20,
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
  },
  loginLink: {
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default Signup;