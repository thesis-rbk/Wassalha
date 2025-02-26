import { Platform } from 'react-native';

export const FontFamily = {
  // Regular weights
  regular: Platform.select({
    ios: 'SFPro-Display-Regular',
    android: 'Inter_18pt-Regular',
  }),
  medium: Platform.select({
    ios: 'SFPro-Display-Medium',
    android: 'Inter_28pt-Medium',
  }),
  semibold: Platform.select({
    ios: 'SFPro-Display-Semibold',
    android: 'Inter_28pt-Bold',
  }),
  bold: Platform.select({
    ios: 'SFPro-Display-Bold',
    android: 'Inter_28pt-Bold',
  }),
  // Additional weights
  thin: Platform.select({
    ios: 'SFPro-Display-Thin',
    android: 'Inter_18pt-Thin',
  }),
  light: Platform.select({
    ios: 'SFPro-Display-Light',
    android: 'Inter_18pt-Light',
  }),
  black: Platform.select({
    ios: 'SFPro-Display-Black',
    android: 'Inter_28pt-Black',
  }),
  // Italic variants
  italic: Platform.select({
    ios: 'SFPro-Display-RegularItalic',
    android: 'Inter_18pt-Italic',
  }),
  mediumItalic: Platform.select({
    ios: 'SFPro-Display-MediumItalic',
    android: 'Inter_18pt-MediumItalic',
  }),
  // Additional iOS-specific weight
  heavy: Platform.select({
    ios: 'SFPro-Display-Heavy',
    android: 'Inter_28pt-Black',
  }),
}; 