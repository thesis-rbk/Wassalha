import { View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedViewProps } from '@/types/ThemedViewProps';



export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <View
      style={[
        { backgroundColor: Colors[colorScheme].background },
        style,
      ]}
      {...otherProps}
    />
  );
}
