import { View, Text, StyleSheet, Platform, ScrollView, Switch } from "react-native";
import { SmallButton, MediumButton, BigButton, LoginButton } from '@/components/ui/buttons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FontFamily } from '@/assets/fonts';
import { Colors } from '@/constants/Colors';
import { TitleLarge, TitleSection, TitleSub, BodyLarge, BodyMedium } from '@/components/Typography';
import { InputField } from '@/components/InputField';
import { Card } from '@/components/Card';
import { StatusIndicator } from '@/components/StatusIndicator';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

import { User, Category, GoodsPost, GoodsProcess, Notification, Order, ProcessEvent, PromoPost, Reputation, ServiceProvider, Sponsorship, Subscription } from "../types/index";
export default function Index() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Theme Toggle */}
        <View style={styles.themeToggle}>
          <ThemedText>Dark Mode</ThemedText>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
          />
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    gap: 16,
  },
  buttonContainer: {
    gap: 20,
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
});
