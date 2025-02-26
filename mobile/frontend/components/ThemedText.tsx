import { Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontFamily } from '@/assets/fonts';
import { ThemedTextProps } from '@/types/ThemedTextProps';

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Text
      style={[
        styles[type],
        { 
          color: Colors[colorScheme].text,
          fontFamily: FontFamily.regular 
        },
        type === 'link' && { color: Colors[colorScheme].primary },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: FontFamily.semibold,
  },
  title: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FontFamily.medium,
  },
  link: {
    fontSize: 16,
  },
});
