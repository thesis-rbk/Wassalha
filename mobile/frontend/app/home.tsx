import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwtToken');
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || 'User'}!</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Token: {token}</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});