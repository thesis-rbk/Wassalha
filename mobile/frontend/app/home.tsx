import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import HomeScreen from '@/screens/HomeScreen';
import { BaseButton } from '@/components/ui/buttons/BaseButton';


import { Navigation } from 'lucide-react-native';
import { Order } from './order';
// Add this type definition

export default function Home() {
  return (
    <>
      <HomeScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});



/**
 * <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || 'User'}!</Text>
     <Text>Email: {user?.email}</Text>
      <Text>Token: {token}</Text>
      <BaseButton 
        onPress={() => router.push('/test/TestProductDetails')}
        size="large"
        style={{ marginVertical: 10 }}
      >
        Test Product Details
      </BaseButton>
      <BaseButton 
        onPress={() => router.push('/test/TestMap')}
        size="large"
        style={{ marginVertical: 10 }}
      >
        Track Flight
      </BaseButton>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
 */