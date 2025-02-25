import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontFamily } from '@/assets/fonts';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

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
