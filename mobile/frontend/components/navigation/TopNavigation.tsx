import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  Bell,
  Menu,
  ChevronRight,
  Settings,
  ShoppingBag,
  Plane,
  LogOut,
  Moon,
  Sun,
  PenSquare,
  DollarSign,
  Users,
  Home
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { TopNavigationProps } from '@/types/TopNavigationProps';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, Link } from 'expo-router';
import { SideMenu } from '@/types/Sidemenu';
import { RootState } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../store/authSlice';
import { useNotification } from '@/context/NotificationContext';
// Define valid app routes
import axiosInstance from '@/config';

// Updated SideMenu interface

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.8;

export function TopNavigation({
  title,
  onNotificationPress,
  onProfilePress,
}: TopNavigationProps) {
  const colorScheme = useColorScheme() ?? "light";
  const { toggleTheme } = useTheme();
  const [menuAnimation] = useState(new Animated.Value(-MENU_WIDTH));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tokeny, setToken] = useState<string | null>(null);
  const [isSponsor, setIsSponsor] = useState<boolean>(false)
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { unreadCount } = useNotification();
  console.log("User:", user);

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");

      // 1. Clear Redux state
      dispatch(logout());
      console.log("Redux state cleared");

      // 2. Clear ALL AsyncStorage items related to authentication
      await AsyncStorage.removeItem("jwtToken");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      console.log("AsyncStorage items cleared");

      // 3. Navigate to login screen (only once)
      router.replace("/auth/login");
      console.log("Redirected to login");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const tokenVerif = async () => {
    const tokenys = await AsyncStorage.getItem('jwtToken');
    console.log("token:", tokenys);
    setToken(tokenys);
  };
  const toggleMenu = () => {
    const toValue = isMenuOpen ? -MENU_WIDTH : 0;
    Animated.timing(menuAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };


  console.log("issss sponsor", isSponsor)
  const check = async () => {
    tokenVerif()
    try {
      const response = await axiosInstance.get('/api/checkSponsor', {
        headers: {
          'Authorization': `Bearer ${tokeny}`, // Correct way to pass the token in the header
          'Accept': 'application/json',
        },
      });
      console.log("is sponsor:", response.data);
      setIsSponsor(response.data);
    } catch (err) {
      console.log("Error in check function:", err);
    }
  };
  const menuItems: SideMenu[] = [
    { icon: <Bell size={24} color={Colors[colorScheme].text} />, label: 'Notifications', route: '/screens/NotificationsScreen' },
    { icon: <ShoppingBag size={24} color={Colors[colorScheme].text} />, label: 'Orders', route: '/test/order' },
    { icon: <Plane size={24} color={Colors[colorScheme].text} />, label: 'Trips', route: '/test/Travel' },
    { icon: <Home size={24} color={Colors[colorScheme].text} />, label: 'Home', route: 'home' },
    { icon: <PenSquare size={24} color={Colors[colorScheme].text} />, label: 'Make a Request', route: '/productDetails/create-order' },
    {
      icon: isSponsor ? <DollarSign size={24} color={Colors[colorScheme].text} /> : <Users size={24} color={Colors[colorScheme].text} />,
      label: isSponsor ? 'Create Subscription' : 'Sponsorship',
      route: isSponsor ? 'verification/CreateSponsorPost' : 'screens/SponsorshipScreen' as any
    },
    { 
      icon: <PenSquare size={24} color={Colors[colorScheme].text} />,  
      label: 'Make a report', 
      route: '/reporting-system/create-ticket'
    },
    { icon: <Users size={24} color={Colors[colorScheme].text} />, label: 'Sponsorship', route: '/test/sponsorShip' },
    { icon: <LogOut size={24} color={Colors[colorScheme].text} />, label: 'Log Out', onPress: handleLogout },
  ];
  useEffect(() => {
    check() // Check if user is a sponsor
  }, [tokeny]);
  const handleRoutes = (item: SideMenu) => {
    try {
      if (item.onPress) {
        item.onPress();
      } else if (item.route) {
        router.push(item.route as any);
      }
    } catch (err) {
      console.error('Error from navigation:', err);
    }
  };

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: "white" },
        ]}
      >
        <TouchableOpacity onPress={toggleMenu}>
          <Menu color="black" size={24} />
        </TouchableOpacity>
       
      
       
        <TouchableOpacity 
          onPress={() => {
            try {
              console.log('Attempting to navigate to NotificationsScreen');
              router.push('/screens/NotificationsScreen');
            } catch (err) {
              console.error('Navigation error:', err);
            }
          }}
        >
          <View style={styles.notificationContainer}>
            <Bell color="black" size={24} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}

      <Animated.View
        style={[
          styles.menu,
          {
            backgroundColor: Colors[colorScheme].background,
            transform: [{ translateX: menuAnimation }],
          },
        ]}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <ThemedText style={styles.profileInitial}>
              {user?.name?.charAt(0) || 'U'}
            </ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>
              {user?.name || 'User'}
            </ThemedText>
            <TouchableOpacity
              style={styles.viewProfile}
              onPress={() => router.push('/profile')}
            >
              <ThemedText style={styles.viewProfileText}>
                View and edit profile
              </ThemedText>
              <ChevronRight size={16} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuItems}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleRoutes(item)}
            >
              {item.icon}
              <ThemedText style={styles.menuItemText}>{item.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.darkModeToggle} onPress={toggleTheme}>
          {colorScheme === 'dark' ? (
            <Sun size={24} color={Colors[colorScheme].text} />
          ) : (
            <Moon size={24} color={Colors[colorScheme].text} />
          )}
          <ThemedText style={styles.darkModeText}>
            {colorScheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    zIndex: 2,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  profileInitial: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  viewProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewProfileText: {
    fontSize: 14,
    marginRight: 5,
    color: "#2196F3",
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  darkModeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  darkModeText: {
    fontSize: 16,
    marginLeft: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});
