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
  const [price, setPrice] = useState(parsedData ? parsedData.price.toString() : '');
  const [productDetails, setProductDetails] = useState(parsedData ? parsedData.description : '');
  const [withBox, setWithBox] = useState(false);

  const clearProductImage = () => setProductImage('');

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images!');
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Create form data
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'upload.jpg',
        } as any);

        try {
          // Upload image
          const response = await fetch(process.env.EXPO_PUBLIC_MEDIA_UPLOAD_URL!, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const data = await response.json();
          console.log('Upload response:', data);
          
          if (data.success) {
            setProductImage(data.data.url);
          } else {
            Alert.alert('Upload failed', data.message);
          }
        } catch (error) {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleNext = () => {
    const productData = {
      name: productName,
      price: price.toString(),
      details: productDetails,
      withBox: withBox.toString(),
      imageUrl: productImage,
    };

    console.log('Sending data:', productData);
    router.push({
      pathname: '/productDetails/additional-details',
      params: productData
    });
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
              <BaseButton size="small" onPress={clearProductImage} style={styles.clearImageButton}>
                <X size={14} color="#999" />
              </BaseButton>
            </View>
          ) : null}
          
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    justifyContent: 'flex-start',
  },
  imageWrapper: { position: 'relative' },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  clearImageButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 4,
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
