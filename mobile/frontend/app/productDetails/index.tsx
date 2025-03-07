import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { Camera, X, Minus, Plus } from 'lucide-react-native';
import { InputField } from '@/components/InputField';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { TitleLarge, TitleSection, TitleSub, BodyMedium } from '@/components/Typography';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams } from 'expo-router';
import { ProductDetailsProps } from '@/types/ProductDetails';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from "@/config";
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('Upload URL:', process.env.EXPO_PUBLIC_MEDIA_UPLOAD_URL);

const ProductDetails: React.FC<ProductDetailsProps> = ({ onNext }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  // Retrieve scrapedData from the query parameters (if available)
  const { scrapedData } = useLocalSearchParams();
  const parsedData = scrapedData ? JSON.parse(scrapedData as string) : null;

  // Initialize form fields with scraped data if available
  const [productName, setProductName] = useState(parsedData ? parsedData.name : '');
  const [productImage, setProductImage] = useState(
    parsedData && parsedData.imageId
      ? `${process.env.EXPO_PUBLIC_MEDIA_VIEW_URL}/${parsedData.imageId}`
      : ''
  );
  const [productImageId, setProductImageId] = useState(null);
  const [price, setPrice] = useState(parsedData ? parsedData.price.toString() : '');
  const [productDetails, setProductDetails] = useState(parsedData ? parsedData.description : '');
  const [withBox, setWithBox] = useState(false);
  const [goodsId, setGoodsId] = useState(parsedData ? parsedData.goodsId : '');

  const clearProductImage = () => setProductImage('');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        setProductImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  
  const handleNext = () => {
    try {
      console.log('🚀 Starting navigation to additional details...');
      console.log('📝 Product data being passed:', {
        name: productName,
        price,
        details: productDetails,
        withBox: withBox.toString(),
        imageUri: productImage,
      });

      router.push({
        pathname: '/productDetails/additional-details',
        params: {
          name: productName,
          price: price,
          details: productDetails,
          withBox: withBox.toString(),
          imageUri: productImage,
        }
      });
      console.log('✅ Navigation successful');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to proceed to next step. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <TitleLarge style={styles.mainTitle}>1. Product Details</TitleLarge>
        
        <InputField
          label="Product name"
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
          style={styles.input}
        />

        <TitleSection style={styles.sectionTitle}>Product Image</TitleSection>
        <View style={styles.imageContainer}>
          {productImage ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: productImage }} style={styles.productImage} />
            </View>
          ) : (
            <View style={styles.uploadCard}>
              <BaseButton 
                size="medium" 
                onPress={pickImage} 
                style={styles.uploadButton}
              >
                <Camera size={20} color={Colors[colorScheme].primary} />
                <BodyMedium style={styles.uploadText}>Upload image</BodyMedium>
              </BaseButton>
            </View>
          )}
        </View>
        
        <InputField
          label="Price"
          value={price}
          onChangeText={setPrice}
          placeholder="Enter product price"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <InputField
          label="Product details"
          value={productDetails}
          onChangeText={setProductDetails}
          placeholder="Enter product details"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />
        
        <View style={styles.switchContainer}>
          <View style={styles.switchTextContainer}>
            <View style={styles.switchHeader}>
          <TitleSub>With box</TitleSub>
          <Switch
            value={withBox}
            onValueChange={setWithBox}
                trackColor={{ false: '#e0e0e0', true: Colors[colorScheme].primary }}
            thumbColor={withBox ? '#ffffff' : '#ffffff'}
          />
            </View>
            <BodyMedium style={styles.switchDescription}>
              Requiring the box may reduce the number of offers you receive. Travelers generally prefer to deliver orders without the box to save space.
            </BodyMedium>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <BaseButton size="large" onPress={handleNext}>
            <BodyMedium style={styles.buttonText}>Next</BodyMedium>
          </BaseButton>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainTitle: { marginBottom: 16, fontSize: 20 },
  sectionTitle: { marginTop: 12, marginBottom: 8, fontSize: 16 },
  input: { marginBottom: 12 },
  imageContainer: {
    marginBottom: 16,
  },
  imageWrapper: {
    width: 120,
    height: 120,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  uploadCard: {
    width: 160,
    height: 110,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 6,
    backgroundColor: 'rgba(0, 128, 152, 0.05)',
    overflow: 'hidden',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    gap: 4,
    elevation: 0,
    shadowOpacity: 0,
  },
  uploadText: { fontSize: 12 },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
    marginBottom: 0,
  },
  switchContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 12,
  },
  switchTextContainer: { flex: 1 },
  switchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  switchDescription: { fontSize: 12, color: '#666666', lineHeight: 16 },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
  },
  buttonText: { color: '#ffffff' },
});

export default ProductDetails;
