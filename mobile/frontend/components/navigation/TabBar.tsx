import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import {
  Home,
  ShoppingBag,
  Plane,
  Crown,
  User,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TabItem } from "@/types/TabItem";
import { useRouter } from "expo-router";
import { Route } from "expo-router";
import { TabBarProps } from "@/types/TabBarProps";



export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = Colors[colorScheme].text;
  const activeTabColor = Colors[colorScheme].primary;
  const router = useRouter();

  const tabs: TabItem[] = [
    {
      name: "home",
      label: "Home",
      icon: (isActive: boolean) => (
        <Home size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "/home" as Route,
    },
    {
      name: "orders",
      label: "Orders",
      icon: (isActive: boolean) => (
        <ShoppingBag size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "/orders&requests/order" as Route,
    },
    {
      name: "travel",
      label: "Travel",
      icon: (isActive: boolean) => (
        <Plane size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "/goodPost/goodpostpage" as Route,
    },
    {
      name: "sponsor",
      label: "Sponsor",
      icon: (isActive: boolean) => (
        <Crown size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "/verification/fetchAll" as Route,
    },
    {
      name: "more",
      label: "See More",
      icon: (isActive: boolean) => (
        <User size={24} color={isActive ? activeTabColor : iconColor} />
      ),
      route: "/more" as Route,
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
          <Pressable
            key={tab.name || `tab-${index}`}
            style={styles.tab}
            onPress={() => handleRoutes(tab)}
            android_ripple={{
              color: Colors[colorScheme].primary,
              borderless: true,
              radius: 24
            }}
          >
            {typeof tab.icon === "function" ? tab.icon(isActive) : tab.icon}
            {tab.label && tab.label.length > 0 ? (
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabText,
                    { color: isActive ? activeTabColor : iconColor }
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={[styles.activeTabIndicator, { backgroundColor: activeTabColor }]} />}
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    elevation: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  labelContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  tabText: {
    fontSize: 12,
    fontFamily: "sans-serif",
    marginTop: 2,
  },
  activeTabText: {
    fontWeight: "bold",
  },
  activeTabIndicator: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    marginTop: 3,
  }
});