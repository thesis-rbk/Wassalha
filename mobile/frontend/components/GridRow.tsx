import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Grid } from '@/constants/Grid';
import { GridRowProps } from '@/types/GridRowProps';



export function GridRow({
  children,
  spacing = 'md',
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  style,
  ...otherProps
}: GridRowProps) {
  // Calculate spacing value
  const spacingValue = typeof spacing === 'string' ? Grid.spacing[spacing] : spacing;

  return (
    <View
      style={[
        styles.row,
        {
          gap: spacingValue,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
  },
}); 