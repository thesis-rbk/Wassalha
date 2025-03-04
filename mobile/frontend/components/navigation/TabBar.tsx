import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Home,
  ShoppingBag,
  Plane,
  MapPin,
  MessageCircle,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { TabItem } from "@/types/TabItem";
import { useRouter } from "expo-router";
import { Route } from "expo-router";

export function TabBar({
  activeTab,
  onTabPress,
}: {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = Colors[colorScheme].text;
  const router = useRouter();
  const activeTabColor = Colors[colorScheme].primary; // Get the primary color for the active tab

  const tabs: TabItem[] = [
    {
      name: "Home",
      icon: <Home size={24} color={iconColor} />,
      route: "home" as Route,
    },
    {
      name: "Orders",
      icon: <ShoppingBag size={24} color={iconColor} />,
      route: "/test/order" as Route,
    },
    {
      name: "Trips",
      icon: <Plane size={24} color={iconColor} />,
      route: "../test/Travel" as Route,
    },
    {
      name: "Pick-up",
      icon: <MapPin size={24} color={iconColor} />,
      route: "/mapTrack" as Route,
    },
    {
      name: "Messages",
      icon: <MessageCircle size={24} color={iconColor} />,
      route: "/messages/messages" as Route,
    },
  ];
  const handleRoutes = (tab: (typeof tabs)[0]) => {
    try {
      onTabPress(tab.name); // Call the parent callback
      router.push(tab.route);
    } catch (err) {
      console.error("errrrrr from tab", err);
    }
  };
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => handleRoutes(tab)}
        >
          {tab.icon}
          <ThemedText
            style={[
              styles.tabText,
              activeTab === tab.name && styles.activeTabText,
            ]}
          >
            {tab.name}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    fontWeight: "bold",
  },
});
