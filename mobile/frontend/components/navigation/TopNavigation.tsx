"use client"

import { useEffect, useState } from "react"
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, Text, StatusBar } from "react-native"
import { Bell, Menu, ChevronRight, LogOut, PenSquare, DollarSign, Users, Home } from "lucide-react-native"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { ThemedText } from "@/components/ThemedText"
import { useTheme } from "@/context/ThemeContext"
import type { TopNavigationProps } from "@/types/TopNavigationProps"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "expo-router"
import type { SideMenu } from "@/types/Sidemenu"
import type { RootState } from "@/store"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { logout } from "../../store/authSlice"
import { useNotification } from "@/context/NotificationContext"
import axiosInstance from "@/config"

const SCREEN_WIDTH = Dimensions.get("window").width
const SCREEN_HEIGHT = Dimensions.get("window").height
const MENU_WIDTH = SCREEN_WIDTH * 0.8 // Menu width is 80% of the screen width

export function TopNavigation({ title, onNotificationPress, onProfilePress }: TopNavigationProps) {
  const colorScheme = useColorScheme() ?? "light"
  const { toggleTheme } = useTheme()
  const [menuAnimation] = useState(new Animated.Value(-MENU_WIDTH))
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [tokeny, setToken] = useState<string | null>(null)
  const [isSponsor, setIsSponsor] = useState<boolean>(false)
  const router = useRouter()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const { unreadCount } = useNotification()

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...")
      dispatch(logout())
      console.log("Redux state cleared")
      await AsyncStorage.removeItem("jwtToken")
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")
      console.log("AsyncStorage items cleared")
      router.replace("/auth/login")
      console.log("Redirected to login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const tokenVerif = async () => {
    const tokenys = await AsyncStorage.getItem("jwtToken")
    console.log("token:", tokenys)
    setToken(tokenys)
  }

  const toggleMenu = () => {
    const toValue = isMenuOpen ? -MENU_WIDTH : 0
    Animated.timing(menuAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start()
    setIsMenuOpen(!isMenuOpen)
  }

  const check = async () => {
    tokenVerif()
    try {
      const response = await axiosInstance.get("/api/checkSponsor", {
        headers: {
          Authorization: `Bearer ${tokeny}`,
          Accept: "application/json",
        },
      })
      console.log("is sponsor:", response.data)
      setIsSponsor(response.data)
    } catch (err) {
      console.log("Error in check function:", err)
    }
  }

  const menuItems: SideMenu[] = [
    { icon: <Home size={24} color={Colors[colorScheme].text} />, label: "Home", route: "home" },
    {
      icon: <Bell size={24} color={Colors[colorScheme].text} />,
      label: "Notifications",
      route: "/screens/NotificationsScreen",
    },
    {
      icon: isSponsor ? (
        <DollarSign size={24} color={Colors[colorScheme].text} />
      ) : (
        <Users size={24} color={Colors[colorScheme].text} />
      ),
      label: isSponsor ? "Create Subscription" : "Sponsorship",
      route: isSponsor ? "verification/CreateSponsorPost" : ("screens/SponsorshipScreen" as any),
    },
    {
      icon: <PenSquare size={24} color={Colors[colorScheme].text} />,
      label: "Make a report",
      route: "/reporting-system/create-ticket",
    },
    {
      icon: <PenSquare size={24} color={Colors[colorScheme].text} />,
      label: "Become a traveler",
      route: "/traveler/becomeTraveler",
    },
    { icon: <LogOut size={24} color={Colors[colorScheme].text} />, label: "Log Out", onPress: handleLogout },
  ]

  useEffect(() => {
    if (tokeny) {
      check()
    }
  }, [tokeny])

  const handleRoutes = (item: SideMenu) => {
    try {
      if (item.onPress) {
        item.onPress()
      } else if (item.route) {
        router.push(item.route as any)
      }
      toggleMenu() // Close the menu after navigation
    } catch (err) {
      console.error("Error from navigation:", err)
    }
  }

  return (
    <>
      <StatusBar backgroundColor="#007BFF" barStyle="light-content" translucent={false} />
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            console.log("Menu icon pressed")
            toggleMenu()
          }}
          style={styles.iconWrapper}
        >
          <Menu color="white" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log("Bell icon pressed")
            try {
              console.log("Attempting to navigate to NotificationsScreen")
              router.push("/screens/NotificationsScreen")
            } catch (err) {
              console.error("Navigation error:", err)
            }
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

      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => {
            console.log("Overlay pressed, closing menu")
            toggleMenu()
          }}
          activeOpacity={1}
        />
      )}

      <Animated.View
        style={[
          styles.menu,
          {
            backgroundColor: Colors[colorScheme].background || "white",
            transform: [{ translateX: menuAnimation }],
          },
        ]}
      >
        <View style={styles.menuHeader}></View>
        <View style={styles.menuContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileImage}>
              <ThemedText style={styles.profileInitial}>{user?.name?.charAt(0) || "U"}</ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{user?.name || "User"}</ThemedText>
              <TouchableOpacity
                style={styles.viewProfile}
                onPress={() => {
                  router.push("/profile")
                  toggleMenu()
                }}
              >
                <ThemedText style={styles.viewProfileText}>View and edit profile</ThemedText>
                <ChevronRight size={16} color={Colors[colorScheme].text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.menuItemsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuItemsContent}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleRoutes(item)}>
                {item.icon}
                <ThemedText style={styles.menuItemText}>{item.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
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
  iconWrapper: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1500,
  },
  menu: {
    position: "absolute",
    top: 0, // Menu starts from the very top of the screen
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    zIndex: 2000,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  viewProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewProfileText: {
    fontSize: 14,
    marginRight: 4,
    color: "#007BFF",
  },
  menuItemsContainer: {
    flex: 1,
  },
  menuItemsContent: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
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

