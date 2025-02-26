import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts'; // New import
import axiosInstance from '../../config'

console.log('Signup module loaded...');

const Signup = () => {
 

  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); // New state for alert

  // Password strength checker function
  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) {
      return 'weak';
    }
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

    if (pwd.length >= 12 && strengthScore >= 3) {
      return 'strong';
    } else if (pwd.length >= 8 && strengthScore >= 2) {
      return 'normal';
    } else {
      return 'weak';
    }
  };

  // Validation functions
  const isNameValid = (name: string) => name.trim() !== '';
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordRequirements = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  // Handle email change with validation
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text && !isEmailValid(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  // Handle password change with strength and requirements check
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(checkPasswordStrength(text));
    setPasswordError(checkPasswordRequirements(text));
    if (confirmPassword) {
      setConfirmPasswordError(text === confirmPassword ? null : 'Passwords do not match');
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (text && text !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleEmailSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!isNameValid(name)) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (!isEmailValid(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (passwordStrength === 'weak' || checkPasswordRequirements(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long and include an uppercase letter and a number');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    console.log('Signup payload:', { name, email, password });
    try {
      const res = await axiosInstance.post('/api/users/register', {
        name,
        email,
        password,
      });
      const data = res.data;

      if (res.status === 200) {
        await AsyncStorage.setItem('jwtToken', data.token || '');
        setShowSuccessAlert(true); // Show AwesomeAlert
      } else {
        Alert.alert('Error', data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'red';
      case 'normal': return 'orange';
      case 'strong': return 'green';
      default: return 'gray';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
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
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && <Text style={styles.errorText}>{emailError}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
      {passwordStrength && (
        <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
          Password Strength: {passwordStrength}
        </Text>
      )}
      {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        secureTextEntry
      />
      {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
      <Button title="Sign Up with Email" onPress={handleEmailSignup} />
      <View style={styles.googleButton}>
        <Button title="Sign Up with Google" onPress={() => console.log('hello')} />
      </View>
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text style={styles.loginLink} onPress={() => router.push('/auth/login')}>
          Log In
        </Text>
      </Text>
      <AwesomeAlert
        show={showSuccessAlert}
        showProgress={false}
        title="Success"
        message="Signup successful!"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#00FF00" // Green button
        onConfirmPressed={() => {
          setShowSuccessAlert(false);
          router.push('/auth/login');
        }}
      />
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
  strengthText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
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