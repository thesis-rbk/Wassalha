import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import {
  KeyRound,
  MessageCircleQuestion,
  Coins,
  Banknote,
  Wallet,
  DollarSign,
  Users,
  LogOut,
  ChevronRight,
  Bot,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotification } from "@/context/NotificationContext";
import axiosInstance from "@/config";
import { TabBar } from "@/components/navigation/TabBar";

export default function MorePage() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { user, token } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { unreadCount } = useNotification();
  const [isSponsor, setIsSponsor] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(user);

  const checkSponsorStatus = async () => {
    try {
      const response = await axiosInstance.get("/api/checkSponsor", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setIsSponsor(response.data);
    } catch (err) {
      console.log("Error checking sponsor status:", err);
    }
  };

  useEffect(() => {
    if (token) {
      checkSponsorStatus();
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      if (!user || !user.id) return;

      const response = await axiosInstance.get(`/api/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        console.log("Fetched user data:", response.data);
        setUserData(response.data);
      }
    } catch (err) {
      console.log("Error fetching user data:", err);
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(logout());
      await AsyncStorage.removeItem("jwtToken");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      icon: <Wallet size={24} color={Colors[colorScheme].text} />,
      label: "wallet",
      route: "/verification/Wallet",
    },
    {
      icon: <DollarSign size={24} color={Colors[colorScheme].text} />,
      label: "Payouts History",
      route: "/screens/NotificationsScreen",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      icon: <KeyRound size={24} color={Colors[colorScheme].text} />,
      label: "Change Password",
      route: "/profile/change",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      icon: <Bot size={24} color={Colors[colorScheme].text} />,
      label: "AI Assistance",
      route: "/chatBot/conversation",
    },
    {
      icon: isSponsor ? (
        <Coins size={24} color={Colors[colorScheme].text} />
      ) : (
        <Users size={24} color={Colors[colorScheme].text} />
      ),
      label: isSponsor ? "Create Subscription" : "Be Sponsor",
      route: isSponsor
        ? "/verification/CreateSponsorPost"
        : "/screens/SponsorshipScreen",
    },
    {
      icon: !isSponsor ? (
        <Banknote size={24} color={Colors[colorScheme].text} />
      ) : (
        <Users size={24} color={Colors[colorScheme].text} />
      ),
      label: !isSponsor ? "Create Ticket" : "Be traveler",
      route: !isSponsor
        ? "/verification/CreateSponsorPost"
        : "/traveler/becomeTraveler",
    },
    {
      icon: (
        <MessageCircleQuestion size={24} color={Colors[colorScheme].text} />
      ),
      label: "Make a report",
      route: "/reporting-system/create-ticket",
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.contentContainer}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>
              {userData?.profile?.firstName?.charAt(0) ||
                userData?.name?.charAt(0) ||
                "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text
              style={[styles.profileName, { color: Colors[colorScheme].text }]}
            >
              {userData?.profile?.firstName
                ? `${userData.profile.firstName} ${
                    userData.profile.lastName || ""
                  }`
                : userData?.name || "User"}
            </Text>
            <TouchableOpacity
              style={styles.viewProfile}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.viewProfileText}>View and edit profile</Text>
              <ChevronRight size={16} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.route)}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text
                  style={[
                    styles.menuItemText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </Text>
                  </View>
                )}
                <ChevronRight size={16} color={Colors[colorScheme].text} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <TabBar activeTab="more" onTabPress={(tab) => router.push(tab as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
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
    color: "#007BFF",
    marginRight: 4,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemText: {
    fontSize: 16,
  },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 16,
    backgroundColor: Colors.light.background,
  },
  logoutText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "500",
  },
});
