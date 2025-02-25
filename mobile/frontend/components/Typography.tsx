import { Text, StyleSheet } from 'react-native';
import { FontFamily } from '@/assets/fonts';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TypographyProps {
  children: React.ReactNode;
  style?: any;
}

export function TitleLarge({ children, style }: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  return <Text style={[styles.titleLarge, { color: Colors[colorScheme].text }, style]}>{children}</Text>;
}

export function TitleSection({ children, style }: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  return <Text style={[styles.titleSection, { color: Colors[colorScheme].text }, style]}>{children}</Text>;
}

export function TitleSub({ children, style }: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  return <Text style={[styles.titleSub, { color: Colors[colorScheme].text }, style]}>{children}</Text>;
}

export function BodyLarge({ children, style }: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  return <Text style={[styles.bodyLarge, { color: Colors[colorScheme].text }, style]}>{children}</Text>;
}

export function BodyMedium({ children, style }: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  return <Text style={[styles.bodyMedium, { color: Colors[colorScheme].text }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  titleLarge: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
  },
  titleSection: {
    fontFamily: FontFamily.semibold,
    fontSize: 20,
  },
  titleSub: {
    fontFamily: FontFamily.medium,
    fontSize: 18,
  },
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
  },
  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
  },
}); 