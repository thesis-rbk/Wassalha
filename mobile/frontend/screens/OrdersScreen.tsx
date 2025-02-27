import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { TabBar } from '@/components/navigation/TabBar';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export function OrdersScreen() {
  const [activeTab, setActiveTab] = React.useState('Orders');

  return (
    <ThemedView style={styles.container}>
      <TopNavigation 
        title="Orders"
        onMenuPress={() => {}}
        onNotificationPress={() => {}}
      />
      
      <ScrollView style={styles.content}>
        <ThemedText style={styles.sectionTitle}>List of Orders</ThemedText>
        {/* Add your order items here */}
      </ScrollView>
      
      <TabBar
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 