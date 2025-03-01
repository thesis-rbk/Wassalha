import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { BaseButton } from '../../components/ui/buttons/BaseButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import axiosInstance from '../../config';

const Signup = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  

 

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);

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

  // Handle input changes with validation
  const handleNameChange = (text: string) => {
    setName(text);
    setNameError(isNameValid(text) ? null : 'Name cannot be empty');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(text && !isEmailValid(text) ? 'Please enter a valid email address' : null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(checkPasswordStrength(text));
    setPasswordError(checkPasswordRequirements(text));
    if (confirmPassword) {
      setConfirmPasswordError(text === confirmPassword ? null : 'Passwords do not match');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError(text && text !== password ? 'Passwords do not match' : null);
  };

  const handleEmailSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      if (!name) setNameError('Name is required');
      if (!email) setEmailError('Email is required');
      if (!password) setPasswordError('Password is required');
      if (!confirmPassword) setConfirmPasswordError('Confirm Password is required');
      return;
    }
    if (!isNameValid(name)) {
      setNameError('Name cannot be empty');
      return;
    }
    if (!isEmailValid(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (passwordStrength === 'weak' || checkPasswordRequirements(password)) {
      setPasswordError('Password must be at least 8 characters long and include an uppercase letter and a number');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    console.log('Signup payload:', { name, email, password });
    try {
      const res = await axiosInstance.post('/api/users/register', { name, email, password });
      const data = res.data;

      if (res.status === 201 || res.status === 200) {
        await AsyncStorage.setItem('jwtToken', data.token || '');
        setShowSuccessAlert(true);
      } else {
        setEmailError(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setEmailError('Something went wrong');
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
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo or Header Image */}
        <Image
          source={require('@/assets/images/11.jpeg')} // Replace with your logo
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Welcome Text */}
        <ThemedText style={styles.welcomeText}>Join Us!</ThemedText>
        <ThemedText style={styles.subText}>Sign up to get started</ThemedText>

        {/* Name Input */}
        <InputField
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={handleNameChange}
          error={nameError || undefined}
        />

        {/* Email Input */}
        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={handleEmailChange}
          error={emailError || undefined}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <InputField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          error={passwordError || undefined}
          secureTextEntry
        />
        {passwordStrength && (
          <ThemedText style={[styles.strengthText, { color: getStrengthColor() }]}>
            Password Strength: {passwordStrength}
          </ThemedText>
        )}

        {/* Confirm Password Input */}
        <InputField
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          error={confirmPasswordError || undefined}
          secureTextEntry
        />

        {/* Signup Button */}
        <BaseButton
          variant="primary"
          size="login"
          style={styles.signupButton}
          onPress={handleEmailSignup}
        >
          Sign Up
        </BaseButton>

        {/* Login Link */}
        <ThemedText style={styles.loginText}>
          Already have an account?{' '}
          <ThemedText
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
          >
            Log In
          </ThemedText>
        </ThemedText>
      </ScrollView>

      {/* AwesomeAlert for Success */}
      <AwesomeAlert
        show={showSuccessAlert}
        showProgress={false}
        title="Success"
        message="Signup successful!"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#00FF00"
        onConfirmPressed={() => {
          setShowSuccessAlert(false);
          router.push('/auth/login');
        }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: Colors.light.text + '80', // Slightly transparent
  },
  signupButton: {
    marginTop: 20,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
  },
  loginLink: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  strengthText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default Signup;