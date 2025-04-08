import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
import { Send, AlertCircle, ChevronDown, ChevronUp, Upload } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { useStatus } from '@/context/StatusContext';

export default function ReportIssuePage() {
  const router = useRouter();
  const { show, hide } = useStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null); // State for file

  const qaList: { question: string; answer: string }[] = [
    {
      question: "What should I do if a traveler hasn't responded to my request?",
      answer: "Ensure your request details are clear and appealing. If no response within 48 hours, cancel and create a new request from your dashboard.",
    },
    {
      question: "How do I confirm a traveler's offer?",
      answer: "Go to 'Requests,' select your request, review offers, and click 'Accept' on the preferred one. You'll be notified once confirmed.",
    },
    {
      question: "What if the traveler doesn't send a photo of the purchased good?",
      answer: "Contact them via chat. If no response in 24 hours, submit a ticket under 'Traveler Non-Compliance.'",
    },
    {
      question: "Why is my payment still on hold?",
      answer: "Payments are held until delivery is confirmed. Confirm receipt in the app. If still held, submit a ticket under 'Payment Issues.'",
    },
    {
      question: "What if the good I received is damaged or incorrect?",
      answer: "Inspect during pickup and reject if faulty. Submit a ticket under 'Delivery Issues' with photos.",
    },
    {
      question: "How do I suggest a pickup method?",
      answer: "After payment, go to 'Order Details,' select 'Suggest Pickup,' and choose a method. The traveler must confirm.",
    },
    {
      question: "The traveler didn't show up for an in-person pickup. What do I do?",
      answer: "Contact them via chat. If unresolved, submit a ticket under 'Pickup Issues,' though liability may remain with you.",
    },
    {
      question: "How do I confirm delivery and release payment?",
      answer: "Go to 'Order Details,' click 'Confirm Delivery' after verifying the good. Payment releases within 24 hours.",
    },
    {
      question: "What if I don't see my issue listed here?",
      answer: "Submit a support ticket below with detailed information, and we'll assist you promptly.",
    },
  ];

  const categories: string[] = [
    'Request Issue',
    'Offer Issue',
    'Payment Issue',
    'Pickup Issue',
    'Delivery Issue',
    'Traveler Non-Compliance',
    'Other',
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
          category: category.toUpperCase().replace(/ /g, '_'),
          mediaIds, // Include mediaIds in the request
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Ticket created:', response.data);
      show({
        type: "success",
        title: "Success",
        message: "Your ticket has been submitted successfully. Please wait for an admin to review it.",
        primaryAction: {
          label: "OK",
          onPress: () => {
            hide();
            router.push('/home');
          }
        }
      });
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null); // Clear file after submission
      setShowForm(false);
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

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Report an Issue' }} />
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.leftHeaderSection}>
              <TouchableOpacity
                style={styles.myTicketsButton}
                onPress={() => router.push('/reporting-system/MyTicketsPage')}
              >
                <ThemedText style={styles.myTicketsText}>My Tickets</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.ticketButtonDescription}>
                View your ticket history
              </ThemedText>
            </View>
            <View style={styles.rightHeaderSection}>
              <AlertCircle size={24} color={Colors.light.primary} style={styles.icon} />
              <ThemedText style={styles.headerText}>Report an Issue</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.description}>
            Check our common questions below. If your issue persists, submit a ticket.
          </ThemedText>

          {/* Q&A Section */}
          {qaList.map((qa, index) => (
            <View key={index} style={styles.qaContainer}>
              <TouchableOpacity style={styles.questionRow} onPress={() => toggleQuestion(index)}>
                <ThemedText style={styles.questionText}>{qa.question}</ThemedText>
                {expandedQuestion === index ? (
                  <ChevronUp size={20} color={Colors.light.primary} />
                ) : (
                  <ChevronDown size={20} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
              {expandedQuestion === index && (
                <ThemedText style={styles.answerText}>{qa.answer}</ThemedText>
              )}
            </View>
          ))}

          {/* Ticket Form Toggle */}
          {!showForm && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.showFormButton} onPress={() => setShowForm(true)}>
                <ThemedText style={styles.showFormText}>Still Need Help? Submit a Ticket</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Ticket Form */}
          {showForm && (
            <View style={styles.formContainer}>
              <ThemedText style={styles.formHeader}>Submit a Support Ticket</ThemedText>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Issue Category</ThemedText>
                <View style={styles.categoryContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryButton, category === cat && styles.categoryButtonSelected]}
                      onPress={() => setCategory(cat)}
                    >
                      <ThemedText
                        style={[styles.categoryText, category === cat && styles.categoryTextSelected]}
                      >
                        {cat}
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
                  <ThemedText style={styles.uploadText}>
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
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 8,
  },
  leftHeaderSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  rightHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: '60%',
  },
  icon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.primary,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  qaContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  showFormButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  showFormText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 24,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
    textAlignVertical: 'top' as const,
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
  },
  myTicketsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.primary + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary + '40',
  },
  myTicketsText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  ticketButtonDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginLeft: 3,
  },
  buttonContainer: {
    width: '100%', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
});