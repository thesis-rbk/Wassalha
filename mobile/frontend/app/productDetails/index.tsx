import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { Camera, X, Minus, Plus } from 'lucide-react-native';
import { InputField } from '@/components/InputField';
import { BaseButton } from '@/components/ui/buttons/BaseButton';
import { TitleLarge, TitleSection, TitleSub, BodyMedium } from '@/components/Typography';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams } from 'expo-router';
import { ProductDetailsProps } from '@/types/ProductDetails';

const ProductDetails: React.FC<ProductDetailsProps> = ({ onNext }) => {
  const colorScheme = useColorScheme() ?? 'light';

  // Retrieve scrapedData from the query parameters (if available)
  const { scrapedData } = useLocalSearchParams();
  const parsedData = scrapedData ? JSON.parse(scrapedData as string) : null;

  // Initialize form fields with scraped data if available
  const [productName, setProductName] = useState(parsedData ? parsedData.name : '');
  const [productImage, setProductImage] = useState(
    parsedData && parsedData.imageId
      ? `http://localhost:5000/api/media/${parsedData.imageId}`
      : ''
  );
  const [price, setPrice] = useState(parsedData ? parsedData.price.toString() : '');
  const [quantity, setQuantity] = useState('1');
  const [productDetails, setProductDetails] = useState(parsedData ? parsedData.description : '');
  const [withBox, setWithBox] = useState(false);

  const clearProductImage = () => setProductImage('');

  const incrementQuantity = () => {
    const currentQuantity = parseInt(quantity) || 0;
    setQuantity((currentQuantity + 1).toString());
  };

  const decrementQuantity = () => {
    const currentQuantity = parseInt(quantity) || 0;
    if (currentQuantity > 1) {
      setQuantity((currentQuantity - 1).toString());
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
              <BaseButton size="small" onPress={clearProductImage} style={styles.clearImageButton}>
                <X size={14} color="#999" />
              </BaseButton>
            </View>
          ) : null}

          <View style={styles.uploadCard}>
            <BaseButton size="medium" onPress={() => console.log('Upload Image')} style={styles.uploadButton}>
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

        <View style={styles.quantityContainer}>
          <InputField
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="1"
            keyboardType="number-pad"
            style={[styles.input, styles.quantityInput]}
          />
          <View style={styles.quantityControls}>
            <BaseButton
              size="small"
              onPress={decrementQuantity}
              style={styles.quantityButton}
            >
              <View style={styles.iconContainer}>
                <Minus size={16} color={Colors[colorScheme].primary} />
              </View>
            </BaseButton>
            <BaseButton
              size="small"
              onPress={incrementQuantity}
              style={styles.quantityButton}
            >
              <View style={styles.iconContainer}>
                <Plus size={16} color={Colors[colorScheme].primary} />
              </View>
            </BaseButton>
          </View>
        </View>

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
          <BaseButton size="large" onPress={onNext}>
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
  quantityContainer: { position: 'relative', marginBottom: 12 },
  quantityInput: { paddingRight: 90, height: 40, zIndex: 1 },
  quantityControls: {
    position: 'absolute',
    right: 8,
    top: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    zIndex: 2,
    height: 28,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(0, 128, 152, 0.05)',
    borderRadius: 4,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  iconContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default ProductDetails;
