"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { ChevronDown } from "lucide-react-native"
import { InputField } from "@/components/InputField"
import { BaseButton } from "@/components/ui/buttons/BaseButton"
import { TitleLarge, TitleSection, BodyMedium } from "@/components/Typography"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Category } from '@/types/Category'
import axiosInstance from "@/config"
import AsyncStorage from "@react-native-async-storage/async-storage"

const AdditionalDetails: React.FC = () => {
  const colorScheme = useColorScheme() ?? "light"
  const router = useRouter()
  const params = useLocalSearchParams()

  // Update the productDetails conversion to include all passed data
  const productDetails = {
    name: params.name as string,
    price: parseFloat(params.price as string),
    details: params.details as string,
    withBox: params.withBox === 'true',
    imageUri: params.imageUri as string | undefined
  }

  console.log('Received and converted data:', productDetails)

  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [size, setSize] = useState("")
  const [weight, setWeight] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [notes, setNotes] = useState("")
  const [categoryError, setCategoryError] = useState<string>("")

  // Add new state for request details
  const [quantity, setQuantity] = useState("")
  const [goodsLocation, setGoodsLocation] = useState("")
  const [goodsDestination, setGoodsDestination] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")

  // Add this to handle closing dropdown when clicking outside
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/categories")
        if (response.status === 200) {
          setCategories(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const handleCategorySelect = (id: number) => {
    setCategoryId(id)
    setShowCategoryDropdown(false)
  }

  const handleSubmit = async () => {
    try {
      console.log('🚀 Starting submission process...');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      console.log('🔑 Token retrieved:', jwtToken ? 'Found' : 'Not found');

      // Test connection before main request
      try {
        console.log('🔄 Testing connection...');
        const testResponse = await axiosInstance.get('/api/categories');
        console.log('✅ Connection test successful');
      } catch (e) {
        console.error('❌ Connection test failed:', e);
      }

      const formData = new FormData();
      
      // Log each field being added
      const fields = {
        name: productDetails.name,
        price: productDetails.price.toString(),
        description: productDetails.details,
        categoryId: categoryId!.toString(),
        size,
        weight,
        isVerified: 'false'
      };

      console.log('Adding fields to FormData:', fields);
      Object.entries(fields).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      console.log('📝 Creating FormData with fields:', fields);
      // 3. Image Handling
      if (productDetails.imageUri) {
        console.log('Starting image processing...');
        console.log('Original imageUri:', productDetails.imageUri);
        
        const uriParts = productDetails.imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const imageData = {
          uri: productDetails.imageUri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        };
        console.log('Final imageData:', imageData);
        console.log('🖼️ Processing image:', productDetails.imageUri);
        console.log('📦 FormData before image:', formData);
        formData.append('image', imageData as any);
        console.log('📦 FormData after image append');
      }

      console.log('📡 Making API call to:', `${axiosInstance.defaults.baseURL}/api/goods`);
      const goodsResponse = await axiosInstance.post('/api/goods', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            console.log('⏫ Upload progress:', Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        }
      });

      console.log('✅ Goods creation successful:', goodsResponse.data);
      
      // if (goodsResponse.data.success) {
      //   // 7. Creating Request
      //   console.log('Creating request with goods ID:', goodsResponse.data.data.id);
      //   const requestData = {
      //     goodsId: goodsResponse.data.data.id,
      //     quantity: parseInt(quantity),
      //     goodsLocation,
      //     goodsDestination,
      //     date: new Date(deliveryDate),
      //     withBox: productDetails.withBox
      //   };

      //   console.log('Request data:', requestData);
      //   const requestResponse = await axiosInstance.post('/api/requests', requestData);
        
      //   console.log('Request creation response:', requestResponse.data);
      //   if (requestResponse.data.success) {
      //     console.log('✅ Goods and Request created successfully');
      //     router.push('/home');
      //   }
      // }
    } catch (error: any) {
      console.error('Detailed error information:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      // tMore specific error messages based on the error type
      if (error.code === 'ECONNABORTED') {
        
        Alert.alert('Error', 'Request timed out. Please try again.');
      } else if (error.response?.status === 413) {
        Alert.alert('Error', 'Image file is too large. Please choose a smaller image.');
      } else if (error.response?.status === 401) {
        Alert.alert('Error', 'Authentication failed. Please log in again.');
      } else {
        Alert.alert('Error', `Failed to create goods and request: ${error.message}`);
      }
    } finally {
      await AsyncStorage.removeItem('token');
    }
  };

  return (
    <ScrollView style={styles.container} scrollEnabled={!dropdownVisible}>
      <View style={styles.card}>
        <TitleLarge style={styles.mainTitle}>Product Details</TitleLarge>

        {/* Category Dropdown */}
        <View style={styles.dropdownContainer}>
          <TitleSection style={styles.sectionTitle}>
            Category * {/* Asterisk indicates required field */}
          </TitleSection>
          <TouchableOpacity 
            style={[
              styles.dropdownTrigger,
              categoryError ? styles.errorBorder : null,
              dropdownVisible ? styles.dropdownTriggerActive : null
            ]} 
            onPress={() => setDropdownVisible(!dropdownVisible)}
            activeOpacity={0.7}
          >
            <BodyMedium 
              style={categoryId ? styles.selectedText : styles.placeholderText}
            >
              {categories.find(c => c.id === categoryId)?.name || "Select a category"}
            </BodyMedium>
            <ChevronDown 
              size={20} 
              color={Colors[colorScheme].primary}
              style={[
                styles.dropdownIcon,
                dropdownVisible ? styles.dropdownIconActive : null
              ]} 
            />
          </TouchableOpacity>
          
          {/* Error message */}
          {categoryError ? (
            <BodyMedium style={styles.errorText}>{categoryError}</BodyMedium>
          ) : null}

          {dropdownVisible && (
            <View style={styles.dropdownMenu}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                {categories.map((category) => (
                  <TouchableOpacity 
                    key={category.id} 
                    style={[
                      styles.dropdownItem,
                      categoryId === category.id && styles.dropdownItemSelected
                    ]} 
                    onPress={() => {
                      handleCategorySelect(category.id);
                      setDropdownVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <BodyMedium style={[
                      styles.dropdownItemText,
                      categoryId === category.id && styles.dropdownItemTextSelected
                    ]}>
                      {category.name}
                    </BodyMedium>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Size Input */}
        <InputField
          label="Size (Optional)"
          value={size}
          onChangeText={setSize}
          placeholder="Enter size"
          style={styles.input}
        />

        {/* Weight Input */}
        <InputField
          label="Weight in kg (Optional)"
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter weight"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        {/* Additional Notes */}
        <InputField
          label="Additional Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special instructions or requirements"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />

        <View style={styles.divider} />

        <TitleLarge style={styles.mainTitle}>Delivery Details</TitleLarge>

        <InputField
          label="Quantity *"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Enter quantity"
          keyboardType="numeric"
          style={styles.input}
        />

        <InputField
          label="Pickup Location *"
          value={goodsLocation}
          onChangeText={setGoodsLocation}
          placeholder="Enter pickup location"
          style={styles.input}
        />

        <InputField
          label="Delivery Location *"
          value={goodsDestination}
          onChangeText={setGoodsDestination}
          placeholder="Enter delivery location"
          style={styles.input}
        />

        <InputField
          label="Delivery Date *"
          value={deliveryDate}
          onChangeText={setDeliveryDate}
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <BaseButton 
            size="large" 
            onPress={handleSubmit}
            disabled={!categoryId || !quantity || !goodsLocation || !goodsDestination}
          >
            <BodyMedium style={styles.buttonText}>
              Create Product & Request
            </BodyMedium>
          </BaseButton>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 16,
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  dropdownTriggerActive: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  dropdownIcon: {
    transform: [{ rotate: '0deg' }],
  },
  dropdownIconActive: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'auto', // Changed from fixed value
    marginTop: 4, // Add some space between trigger and menu
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  dropdownItemSelected: {
    backgroundColor: Colors.light.primary + '10', // Add slight tint for selected item
  },
  dropdownItemText: {
    color: "#333",
  },
  dropdownItemTextSelected: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  placeholderText: {
    color: "#999",
  },
  selectedText: {
    color: "#333",
    fontWeight: '500',
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 24,
  },
  buttonText: {
    color: "#ffffff",
  },
  errorBorder: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
})

export default AdditionalDetails

