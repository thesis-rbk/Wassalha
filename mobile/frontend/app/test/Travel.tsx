import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Travel() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const chatState = useSelector((state: RootState) => state.chat);
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Travel Screen</ThemedText>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].primary }
          ]}
          onPress={() => {
            try {
              console.log('🔄 Attempting to navigate to chatreduxtest');
              router.push('/test/chatreduxtest');
              console.log('✅ Navigation call completed');
            } catch (error) {
              console.error('❌ Navigation error:', error);
            }
          }}
        >
          <ThemedText style={styles.buttonText}>
            Test Chat Redux
          </ThemedText>
        </TouchableOpacity>
        
        <Link href="/test/chatreduxtest" asChild style={{ marginTop: 20 }}>
          <TouchableOpacity 
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme].secondary }
            ]}
          >
            <ThemedText style={styles.buttonText}>
              Test Chat Redux (Link)
            </ThemedText>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity 
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].primary, marginTop: 10 }
          ]}
          onPress={() => router.push('/test/chat-test')}
        >
          <ThemedText style={styles.buttonText}>
            Test Chat Implementation
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', width: '100%'}}>
        <ThemedText style={{fontWeight: 'bold', marginBottom: 10}}>
          Chat State:
        </ThemedText>
        <ThemedText>
          {JSON.stringify(chatState, null, 2)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});