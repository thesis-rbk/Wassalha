import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Send, Upload } from 'lucide-react-native';
import axiosInstance from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import Header from '@/components/navigation/headers';
import { useStatus } from '@/context/StatusContext';
interface TicketFormProps {
  onSuccess: () => void;
}

interface Category {
  id: string;
  label: string;
}

const ReportIssuePage: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const { show, hide } = useStatus();
  const categories: Category[] = [
    { id: 'REQUEST_ISSUE', label: 'Request Issue' },
    { id: 'OFFER_ISSUE', label: 'Offer Issue' },
    { id: 'PAYMENT_ISSUE', label: 'Payment Issue' },
    { id: 'PICKUP_ISSUE', label: 'Pickup Issue' },
    { id: 'DELIVERY_ISSUE', label: 'Delivery Issue' },
    { id: 'TRAVELER_NON_COMPLIANCE', label: 'Traveler Non-Compliance' },
    { id: 'OTHER', label: 'Other' },
  ];

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to pick file. Please try again.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    }
  };

  const handleSubmitTicket = async () => {
    if (!title.trim() || !description.trim() || !category) {
      show({
        type: "error",
        title: "Error",
        message: "Please fill in all fields",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      let mediaIds: number[] = [];

      // Upload file if selected
      if (file && !file.canceled && file.assets && file.assets.length > 0) {
        const formData = new FormData();
        const asset = file.assets[0];
        formData.append('file', {
          uri: asset.uri,
          name: asset.name || 'file',
          type: asset.mimeType || 'application/octet-stream',
        } as any);

        const uploadResponse = await axiosInstance.post('/api/media/upload', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.data.success) {
          mediaIds = [uploadResponse.data.data.id]; // Assuming response contains media ID
        } else {
          throw new Error('Failed to upload file');
        }
      }

      // Submit ticket with mediaIds
      const response = await axiosInstance.post(
        '/api/tickets/create',
        {
          title,
          description,
          category: category,
          mediaIds, // Include mediaIds in the request
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Ticket created:', response.data);
      Alert.alert(
        'Success',
        'Your ticket has been submitted successfully. Please wait for an admin to review it.',
        [{ text: 'OK', onPress: onSuccess }]
      );
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null); // Clear file after submission
    } catch (error) {
      console.error('Error creating ticket:', error);
      show({
        type: "error",
        title: "Error",
        message: "Failed to create ticket. Please try again.",
        primaryAction: {
          label: "OK",
          onPress: hide
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header title="Create A Report" subtitle='We will get back to you' showBackButton={true} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.formHeader}>Submit a Support Ticket</ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Issue Category</ThemedText>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryButton, category === cat.id && styles.categoryButtonSelected]}
                onPress={() => setCategory(cat.id)}
              >
                <ThemedText
                  style={[styles.categoryText, category === cat.id && styles.categoryTextSelected]}
                >
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter a brief title"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your issue in detail..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Upload File (Optional)</ThemedText>
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickFile}>
            <Upload size={20} color={Colors.light.primary} style={styles.uploadIcon} />
            <ThemedText style={styles.uploadText} numberOfLines={1} ellipsizeMode="middle">
              {file && !file.canceled && file.assets ? file.assets[0].name : 'Choose a file'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title.trim() || !description.trim() || !category) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitTicket}
          disabled={isLoading || !title.trim() || !description.trim() || !category}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={20} color="#fff" style={styles.submitIcon} />
              <ThemedText style={styles.submitButtonText}>Submit Ticket</ThemedText>
            </>
          )}
        </TouchableOpacity>

        {/* Add extra space at the bottom for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
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
    height: 150,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadText: {
    fontSize: 16,
    color: Colors.light.primary,
    flex: 1,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
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
  },
  bottomPadding: {
    height: 30, // Extra padding at the bottom for better scrolling
  }
});

export default ReportIssuePage;