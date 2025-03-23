import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Grid } from '@/constants/Grid';
import { GridContainerProps } from '@/types/GridContainerProps';



export function GridContainer({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  safeArea = true,
}: GridContainerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  const Container = safeArea ? SafeAreaView : React.Fragment;
  const containerProps = safeArea ? {
    style: [
      styles.safeArea,
      { backgroundColor: Colors[colorScheme].background },
      style
    ]
  } : {};

  return (
    <Container {...containerProps}>
      {scroll ? (
        <ScrollView
          style={[styles.scrollView, !safeArea && style]}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <>{children}</>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Grid.safeArea.top,
    paddingBottom: Grid.safeArea.bottom,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Grid.spacing.xl,
  }
}); 