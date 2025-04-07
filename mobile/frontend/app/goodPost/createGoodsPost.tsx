import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, useFocusEffect } from 'expo-router';
import axiosInstance from '@/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Category } from '@/types/Category';
import { ArrowLeft, Calendar, Package, MapPin, AlertTriangle, Plane } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function CreateGoodsPost() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isTraveler, setIsTraveler] = useState<boolean | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [travelerId, setTravelerId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    departureDate: new Date(),
    arrivalDate: new Date(),
    availableKg: '',
    originLocation: '',
    airportLocation: '',
    categoryId: '',
  });
  const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false);
  const [showArrivalDatePicker, setShowArrivalDatePicker] = useState(false);

  // Force reset and recheck whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - resetting state and checking traveler status');
      resetTravelerState();
      fetchCategories();
      
      // Small delay to ensure auth context is fully updated
      setTimeout(() => {
        checkTravelerStatus();
      }, 100);
      
      return () => {
        console.log('Screen unfocused - cleaning up');
      };
    }, [])
  );

  // Watch for user changes
  useEffect(() => {
    console.log(`User effect triggered. Current: ${currentUserId}, New: ${user?.id}`);
    
    if (user?.id !== currentUserId) {
      console.log(`User changed from ${currentUserId} to ${user?.id}`);
      resetTravelerState();
      setCurrentUserId(user?.id || null);
      
      // Small delay to ensure state is reset before checking
      setTimeout(() => {
        checkTravelerStatus();
      }, 100);
    }
  }, [user?.id]);

  const resetTravelerState = () => {
    console.log('Resetting traveler state');
    setIsTraveler(null);
    setIsVerified(null);
    setTravelerId(null);
  };

  const checkTravelerStatus = async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping traveler status check');
      setIsTraveler(false);
      setIsVerified(false);
      return;
    }
    
    setIsCheckingStatus(true);
    console.log(`Checking traveler status for user ID: ${user.id}`);
    
    try {
      // Force a completely new request with random parameter
      const random = Math.random().toString(36).substring(7);
      const timestamp = new Date().getTime();
      
      const response = await axiosInstance.get(
        `/api/travelers/check/${user.id}?t=${timestamp}&r=${random}`, 
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
      
      console.log(`Traveler status response for user ${user.id}:`, response.data);
      
      // Explicitly set state based on response
      if (response.data.isTraveler === true) {
        setIsTraveler(true);
        setIsVerified(response.data.isVerified === true);
        setTravelerId(response.data.travelerId || null);
      } else {
        setIsTraveler(false);
        setIsVerified(false);
        setTravelerId(null);
      }
      
      console.log(`Updated state - isTraveler: ${response.data.isTraveler}, isVerified: ${response.data.isVerified}`);
    } catch (error) {
      console.error(`Error checking traveler status for user ${user.id}:`, error);
      
      // Reset state on error
      setIsTraveler(false);
      setIsVerified(false);
      setTravelerId(null);
      
      Alert.alert(
        'Error',
        'Failed to check traveler status. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const handleInputChange = (name: string, value: string | Date) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDepartureDateChange = (event: any, selectedDate?: Date) => {
    setShowDepartureDatePicker(false);
    if (selectedDate) {
      handleInputChange('departureDate', selectedDate);
    }
  };

  const handleArrivalDateChange = (event: any, selectedDate?: Date) => {
    setShowArrivalDatePicker(false);
    if (selectedDate) {
      handleInputChange('arrivalDate', selectedDate);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!formData.availableKg) {
      Alert.alert('Error', 'Please enter available kg');
      return false;
    }
    if (!formData.originLocation.trim()) {
      Alert.alert('Error', 'Please enter origin location');
      return false;
    }
    if (!formData.airportLocation.trim()) {
      Alert.alert('Error', 'Please enter destination airport location');
      return false;
    }
    return true;
  };

  const navigateToBecomeTraveler = () => {
    router.push('/traveler/becomeTraveler');
  };

  const handleSubmit = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    if (!validateForm()) return;

    if (!isTraveler) {
      Alert.alert(
        'Traveler Required',
        'You need to be a registered traveler to create a goods post.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Become a Traveler', onPress: navigateToBecomeTraveler }
        ]
      );
      return;
    }

    if (!isVerified) {
      Alert.alert(
        'Verification Required',
        'Your traveler account needs to be verified before you can create goods posts.',
        [
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        ...formData,
        travelerId: travelerId,
        availableKg: parseFloat(formData.availableKg),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      };

      console.log('Sending payload:', payload);
      
      const response = await axiosInstance.post('/api/goods-posts', payload);
      
      if (response.data.success) {
        Alert.alert('Success', 'Goods post created successfully', [
          { text: 'OK', onPress: () => router.push('/goodPost/goodpostpage') }
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create goods post');
      }
    } catch (error: any) {
      console.error('Error creating goods post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create goods post';
      Alert.alert('Error', errorMessage);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Create Goods Post</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {/* Status indicators */}
        {isCheckingStatus ? (
          <View style={styles.statusIndicator}>
            <ActivityIndicator size="small" color="#3a86ff" />
            <ThemedText style={styles.statusText}>Checking traveler status...</ThemedText>
          </View>
        ) : (
          <>
            {/* Traveler Status Banner - Only show if not a traveler */}
            {!isTraveler && (
              <View style={styles.warningBanner}>
                <AlertTriangle size={20} color="#ff9800" />
                <ThemedText style={styles.warningText}>
                  You need to be a verified traveler to create posts.
                </ThemedText>
                <TouchableOpacity onPress={navigateToBecomeTraveler} style={styles.warningButton}>
                  <ThemedText style={styles.warningButtonText}>Become a Traveler</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Verification Status Banner - Only show if traveler but not verified */}
            {isTraveler && !isVerified && (
              <View style={styles.warningBanner}>
                <AlertTriangle size={20} color="#ff9800" />
                <ThemedText style={styles.warningText}>
                  Your traveler account is pending verification.
                </ThemedText>
              </View>
            )}

            {/* Success Banner - Show if traveler and verified */}
            {isTraveler && isVerified && (
              <View style={[styles.warningBanner, styles.successBanner]}>
                <ThemedText style={styles.successText}>
                  You are a verified traveler. You can create posts!
                </ThemedText>
              </View>
            )}
          </>
        )}

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Title</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={styles.textArea}
                placeholder="Enter description"
                value={formData.content}
                onChangeText={(text) => handleInputChange('content', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Plane size={16} color="#3a86ff" />
                <ThemedText style={styles.label}>Departure Date</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDepartureDatePicker(true)}
              >
                <ThemedText style={styles.dateText}>
                  {formData.departureDate.toLocaleDateString()}
                </ThemedText>
              </TouchableOpacity>
              {showDepartureDatePicker && (
                <DateTimePicker
                  value={formData.departureDate}
                  mode="date"
                  display="default"
                  onChange={handleDepartureDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Calendar size={16} color="#3a86ff" />
                <ThemedText style={styles.label}>Arrival Date</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowArrivalDatePicker(true)}
              >
                <ThemedText style={styles.dateText}>
                  {formData.arrivalDate.toLocaleDateString()}
                </ThemedText>
              </TouchableOpacity>
              {showArrivalDatePicker && (
                <DateTimePicker
                  value={formData.arrivalDate}
                  mode="date"
                  display="default"
                  onChange={handleArrivalDateChange}
                  minimumDate={formData.departureDate}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <MapPin size={16} color="#3a86ff" />
                <ThemedText style={styles.label}>Origin Location</ThemedText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter origin location (city, country)"
                value={formData.originLocation}
                onChangeText={(text) => handleInputChange('originLocation', text)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <MapPin size={16} color="#3a86ff" />
                <ThemedText style={styles.label}>Destination Airport</ThemedText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter destination airport"
                value={formData.airportLocation}
                onChangeText={(text) => handleInputChange('airportLocation', text)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Package size={16} color="#3a86ff" />
                <ThemedText style={styles.label}>Available Weight (kg)</ThemedText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter available kg"
                value={formData.availableKg}
                onChangeText={(text) => handleInputChange('availableKg', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Category</ThemedText>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.categoryId}
                  onValueChange={(itemValue) => handleInputChange('categoryId', itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a category" value="" />
                  {categories.map((category) => (
                    <Picker.Item
                      key={category.id}
                      label={category.name}
                      value={category.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Create Post</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  warningBanner: {
    backgroundColor: '#fff3e0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#e65100',
  },
  warningButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  warningButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  successBanner: {
    backgroundColor: '#e8f5e9',
    borderBottomColor: '#c8e6c9',
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    color: '#333',
  },
  datePickerButton: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#3a86ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#3a86ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
