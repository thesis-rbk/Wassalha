import { View, type ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

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
