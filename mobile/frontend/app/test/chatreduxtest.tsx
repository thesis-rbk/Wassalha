import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ChatReduxTest() {
  const chatState = useSelector((state: RootState) => state.chat);
  
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Chat Redux State Test
      </ThemedText>
      
      <ScrollView>
        <ThemedText>
          {JSON.stringify(chatState, null, 2)}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}