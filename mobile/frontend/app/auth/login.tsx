import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { RootState } from '../../store';
import axiosInstance from '../../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    dispatch(loginStart());
    try {
      const res = await axiosInstance.post('/api/users/login', {
        email,
        password,
      });
      const data = res.data;

      if (res.status === 200) {
        dispatch(loginSuccess({
          token: data.token,
          user: { id: data.user.id, name: data.user.name, email: data.user.email },
        }));
        await AsyncStorage.setItem('jwtToken', data.token);
        router.push('/home');
      } else {
        dispatch(loginFailure(data.error || 'Login failed'));
        Alert.alert('Error', data.error || 'Login failed');
      }
    } catch (error) {
      dispatch(loginFailure('Something went wrong'));
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
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
      <Button
        title={loading ? 'Logging In...' : 'Log In'}
        onPress={handleLogin}
        disabled={loading}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.signupText} onPress={() => router.push('/auth/signup')}>
        Don’t have an account? Sign Up
      </Text>
      <Text style={styles.signupLink} onPress={() => router.push('/auth/ResetPassword')}>
    Forgot Password?
  </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  signupText: { marginTop: 20, textAlign: 'center', color: 'blue' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 10 },
  signupLink: { marginTop: 10, textAlign: 'center', color: 'blue' },
});