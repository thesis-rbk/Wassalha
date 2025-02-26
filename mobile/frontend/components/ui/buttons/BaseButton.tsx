import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontFamily } from '@/assets/fonts';
import { BaseButtonProps } from '@/types/BaseButtonProps';


export function BaseButton({ 
  children, 
  variant = 'primary',
  size = 'medium',
  style,
  ...props 
}: BaseButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = Colors[colorScheme].primary; // This will give us #008098

  return (
    <TouchableOpacity
      {...props}
      style={[
        styles.button,
        styles[size],
        { backgroundColor },
        style
      ]}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 9999, // full rounded
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  small: {
    width: 90,
  },
  medium: {
    width: 121,
  },
  large: {
    width: 181,
  },
  login: {
    width: 400, // Reduced from 620 to 310
  },
  text: {
    fontFamily: FontFamily.semibold,
    fontSize: 18,
    color: '#ffffff',
  },
}); 