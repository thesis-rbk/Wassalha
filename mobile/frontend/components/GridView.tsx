import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { Grid } from '@/constants/Grid';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { GridViewProps } from '@/types/GridViewProps';


export function GridView({
  children,
  column = Grid.column,
  spacing = 'md',
  margin = false,
  padding = false,
  card = false,
  fullWidth = false,
  centered = false,
  style,
  ...otherProps
}: GridViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  // Calculate spacing value - either from Grid.spacing or direct number
  const spacingValue = typeof spacing === 'string' ? Grid.spacing[spacing] : spacing;
  
  // Calculate margin value
  const marginValue = margin === true ? Grid.margin : typeof margin === 'number' ? margin : 0;
  
  // Calculate padding value
  const paddingValue = padding === true ? 
    Grid.padding.horizontal : 
    typeof padding === 'number' ? padding : 0;
  
  // Calculate width for columns
  const columnWidth = fullWidth ? 
    '100%' : 
    Grid.getColumnWidth(column, marginValue, spacingValue);

  return (
    <View
      style={[
        {
          marginHorizontal: marginValue,
          paddingHorizontal: paddingValue,
          gap: spacingValue,
          width: fullWidth ? '100%' : columnWidth,
        },
        card && {
          ...styles.card,
          backgroundColor: Colors[colorScheme].card,
          borderColor: Colors[colorScheme].border,
          borderRadius: Grid.card.borderRadius,
          padding: Grid.card.padding,
          gap: Grid.card.gap,
        },
        centered && styles.centered,
        style,
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 