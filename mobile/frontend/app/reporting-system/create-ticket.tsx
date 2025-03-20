import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TextInput } from 'react-native';
import axiosInstance from '@/config';
import { Colors } from '@/constants/Colors';
import { Send, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateTicketPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmitTicket = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      
      const response = await axiosInstance.post('/api/tickets', 
        {
          title,
          description,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Ticket created:', response.data);
      Alert.alert('Success', 'Your ticket has been submitted successfully , please wait for the admin to review it and get back to you',
        [{ text: 'OK', onPress: () => router.push('/home') }]
      );
    } catch (error) {
      console.error('Error creating ticket:', error);
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Create Support Ticket"
          }}
        />

        <ScrollView style={styles.formContainer}>
          <View style={styles.headerContainer}>
            <AlertCircle size={24} color={Colors.light.primary} style={styles.icon} />
            <ThemedText style={styles.headerText}>
              Report an Issue
            </ThemedText>
          </View>
          
          <ThemedText style={styles.description}>
            Please provide details about your issue and we'll help you resolve it.
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Title of your report</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter a brief title for your issue"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Detailed description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please describe your issue in detail..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!title.trim() || !description.trim()) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitTicket}
            disabled={isLoading || !title.trim() || !description.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={20} color="#fff" style={styles.submitIcon} />
                <ThemedText style={styles.submitButtonText}>
                  Submit Report
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitIcon: {
    marginRight: 8,
  }
}); 