import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Menu } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { TopNavigationProps } from '@/types/TopNavigationProps';



export function TopNavigation({ title, onMenuPress, onNotificationPress }: TopNavigationProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = Colors[colorScheme].text;

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].primary }]}>
      <TouchableOpacity onPress={onMenuPress}>
        <Menu color={Colors[colorScheme].background} size={24} />
      </TouchableOpacity>
      
      <ThemedText style={[styles.title, { color: Colors[colorScheme].background }]}>
        {title}
      </ThemedText>
      
      <TouchableOpacity onPress={onNotificationPress}>
        <Bell color={Colors[colorScheme].background} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    height: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 