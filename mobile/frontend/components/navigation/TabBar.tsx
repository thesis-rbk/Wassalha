import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import {
  Home,
  ShoppingBag,
  MapPin,
  MessageCircle,
  Plus,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TabItem } from "@/types/TabItem";
import { useRouter } from "expo-router";
import { Route } from "expo-router";

interface TabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = Colors[colorScheme].text;
  const activeTabColor = Colors[colorScheme].primary;
  const router = useRouter();

  const tabs: TabItem[] = [
    {
      name: "Home",
      icon: (isActive: boolean) => (
        <Home size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "home" as Route,
    },
    {
      name: "Services",
      icon: (isActive: boolean) => (
        <ShoppingBag size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "../orders&requests/order" as Route,
    },
    {
      name: "", // Empty name for the "+" button
      icon: (isActive: boolean) => (
        <View style={styles.plusIconContainer}>
          <Plus size={28} color="white" />
        </View>
      ),
      route: "/productDetails/create-order" as Route,
    },
    {
      name: "Pick-up",
      icon: (isActive: boolean) => (
        <MapPin size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "../pickup/pickup" as Route,
    },
    {
      name: "Messages",
      icon: (isActive: boolean) => (
        <MessageCircle size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "/messages/messages" as Route,
    },
  ];

  const handleRoutes = (tab: (typeof tabs)[number]) => {
    try {
      onTabPress(tab.name);
      router.push(tab.route as any);
    } catch (err) {
      console.error("Error navigating from tab:", err);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name || `tab-${index}`} // Use index for empty name to avoid key duplication
            style={styles.tab}
            onPress={() => handleRoutes(tab)}
          >
            {/* Render the icon */}
            {typeof tab.icon === "function" ? tab.icon(isActive) : tab.icon}
            {/* Only render label if tab.name exists */}
            {tab.name && tab.name.length > 0 ? (
              <View style={styles.labelContainer}>
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab.name}
                </Text>
                {isActive && <View style={styles.activeTabUnderline} />}
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  labelContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  tabText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  activeTabText: {
    fontWeight: "bold",
    color: Colors.light.primary,
  },
  activeTabUnderline: {
    width: 20,
    height: 2,
    backgroundColor: Colors.light.primary,
    marginTop: 2,
  },
  plusIconContainer: {
    backgroundColor: Colors.light.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
