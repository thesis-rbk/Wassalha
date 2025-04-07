import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import HomeScreen from "@/screens/HomeScreen";
import { BaseButton } from "@/components/ui/buttons/BaseButton";



export default function Home() {
  return (
    <>
      <HomeScreen />
    </>
  );
}
