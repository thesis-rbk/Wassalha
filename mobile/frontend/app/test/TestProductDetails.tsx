import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProductDetails from '../productDetails';

import { ProductDetailsProps } from '@/types/ProductDetails';

export default function TestProductDetails() {
  return (
    <View style={styles.container}>
      <ProductDetails onNext={() => console.log('Next button clicked')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
});

