import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Home,
  ShoppingBag,
  Plane,
  MapPin,
  MessageCircle,
<<<<<<< HEAD
  Plus
=======
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
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
<<<<<<< HEAD
      name: "Order",
      icon: <ShoppingBag size={24} color={iconColor} />,
      route: "../test/order" as Route,
    },
    {
      name: "",
      icon: (<View style={{
        backgroundColor: "#008098",
        borderRadius: 50,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Plus size={24} color="white" /> // White icon on colored background
      </View>),
      route: "/productDetails/create-order" as Route,
=======
      name: "Orders",
      icon: <ShoppingBag size={24} color={iconColor} />,
      route: "/test/order" as Route,
    },
    {
      name: "Trips",
      icon: <Plane size={24} color={iconColor} />,
      route: "../test/Travel" as Route,
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
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
<<<<<<< HEAD
    justifyContent: "space-between", // Ensure equal spacing
=======
    justifyContent: "space-around",
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
    flex: 1, // Ensure each tab takes equal space
=======
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    fontWeight: "bold",
  },
<<<<<<< HEAD
  plusIconContainer: {
    backgroundColor: "#008098",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
=======
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
});
