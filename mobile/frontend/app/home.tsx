import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import HomeScreen from "@/screens/HomeScreen";

// Add this type definition

export default function Home() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  console.log("User:", user);
  const handleLogout = async () => {
    await AsyncStorage.removeItem("jwtToken");
    router.push("/auth/signup");
  };

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
