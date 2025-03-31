"use client"

import React from "react"
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from "react-native"
import { Bell, MessageCircle } from "lucide-react-native"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useRouter } from "expo-router"
import { useNotification } from "@/context/NotificationContext"
import { TopNavigationProps } from "@/types/TopNavigationProps"


export function TopNavigation({ title, onNotificationPress, onProfilePress }: TopNavigationProps) {
  const colorScheme = useColorScheme() ?? "light"
  const router = useRouter()
  const { unreadCount } = useNotification()

  return (
    <>
      <StatusBar backgroundColor="#007BFF" barStyle="light-content" translucent={false} />
      <View style={styles.container}>
        <Text style={styles.title}>Wassalha</Text>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            onPress={() => {
              console.log("Message icon pressed")
              router.push("/messages/messages")
            }}
            style={styles.iconWrapper}
          >
            <MessageCircle color="white" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log("Bell icon pressed")
              router.push("/screens/NotificationsScreen")
            }}
            style={styles.iconWrapper}
          >
            <View style={styles.notificationContainer}>
              <Bell color="white" size={24} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
    backgroundColor: "#007BFF",
    zIndex: 1000,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  iconWrapper: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#E91E63",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
})

