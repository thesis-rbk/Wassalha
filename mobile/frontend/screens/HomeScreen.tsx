<<<<<<< HEAD
import React, { useEffect, useState } from "react";
=======
import React, { useState } from "react";
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
<<<<<<< HEAD
  Button,
} from "react-native";
import axiosInstance from '@/config';
=======
  TouchableOpacity,
  Text,
} from "react-native";
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { TabBar } from "@/components/navigation/TabBar";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
<<<<<<< HEAD
import UserCard from "@/components/fetchCards";
import {
=======
import { Button } from "react-native";
import {
  Search,
  Filter,
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
  Plane,
  ShoppingBag,
  MapPin,
  Crown,
<<<<<<< HEAD
=======
  SlidersHorizontal,
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
<<<<<<< HEAD
import { Traveler } from "@/types/Traveler"
import NotificationItem from "../components/notificationContect";
import Notification from "./Notification";
// Import the NotificationItem component
import axios from "axios";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Home");
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [sponsors, setSponsors] = useState<Traveler[]>([]);
  const [notifications, setNotifications] = useState<{ message: string, timestamp: number }[]>([]);
  const [customMessage, setCustomMessage] = useState<string>('');
=======

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Home");
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { theme } = useTheme();

<<<<<<< HEAD
  useEffect(() => {
    handleBestTraveler();
  }, []);

  const handleBestTraveler = async () => {
    try {
      const result = await axiosInstance.get("/api/besttarveler");
      setTravelers(result.data.traveler);
      setSponsors(result.data.sponsor);
    } catch (err) {
      console.log("errrr", err);
    }
  };
=======
  // Add debug log for initial render
  console.log("HomeScreen rendered");
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32

  const services = [
    {
      title: "Travel",
<<<<<<< HEAD
      icon: <Plane size={40} color="white" />,
=======
      icon: <Plane size={32} color={Colors[colorScheme].primary} />,
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
      route: "../test/Travel" as const,
    },
    {
      title: "Order",
<<<<<<< HEAD
      icon: <ShoppingBag size={40} color="white" />,
=======
      icon: <ShoppingBag size={32} color={Colors[colorScheme].primary} />,
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
      route: "../test/order" as const,
    },
    {
      title: "Pickup",
<<<<<<< HEAD
      icon: <MapPin size={40} color="white" />,
=======
      icon: <MapPin size={32} color={Colors[colorScheme].primary} />,
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
      route: "../mapTrack" as const,
    },
    {
      title: "Subscription",
<<<<<<< HEAD
      icon: <Crown size={40} color="white" />,
      route: "../verification/fetchAll" as const,
    },
  ];

  const handleCardPress = (service: (typeof services)[0]) => {
    try {
      router.push(service.route);
=======
      icon: <Crown size={32} color={Colors[colorScheme].primary} />,
      route: "../test/Subscription" as const,
    },
  ];

  // Add debug log for services
  console.log("Services configured:", services);

  const handleCardPress = (service: (typeof services)[0]) => {
    console.log(`✅ handleCardPress triggered for: ${service.title}`);

    try {
      router.push(service.route);
      console.log(`✅ Navigation to ${service.route} attempted`);
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Navigation failed:`, err);
    }
  };

<<<<<<< HEAD
  const sendTestNotification = () => {
    setNotifications((prev) => [
      ...prev,
      { message: customMessage, timestamp: Date.now() },
    ]);
    setCustomMessage('');
  };

  return (
    <ThemedView style={styles.container}>
      <TopNavigation
        title="Wassalha"
=======
  return (
    <ThemedView style={styles.container}>
      <TopNavigation
        title="Wassalha" // Ensure the title is explicitly set to "Wassalah"
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
        onMenuPress={() => { }}
        onNotificationPress={() => { }}
      />

<<<<<<< HEAD
      {notifications.map((notification, index) => (
        <NotificationItem key={index} message={notification.message} timestamp={notification.timestamp} />
      ))}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
=======
      <ScrollView style={styles.content}>
        {/* Hero Image Card */}
        <View style={styles.heroCard}>
          <Image
            source={require("@/assets/images/11.jpeg")}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <ThemedText style={styles.heroText}>
              Turn Every Trip into an Opportunity
            </ThemedText>
            <ThemedText style={[styles.heroText, styles.heroSubtext]}>
              Deliver, Earn, and Connect.
            </ThemedText>
          </View>
        </View>

        {/* Services Section */}
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
        <View style={styles.servicesSection}>
          <ThemedText style={styles.sectionTitle}>Our Services</ThemedText>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <Card
                key={service.title}
                style={styles.serviceCard}
                onPress={() => handleCardPress(service)}
              >
                <View style={styles.serviceContent}>
                  {service.icon}
                  <ThemedText style={styles.serviceTitle}>
                    {service.title}
                  </ThemedText>
                </View>
              </Card>
            ))}
          </View>
        </View>

<<<<<<< HEAD
        <View style={styles.travelersSection}>
          <ThemedText style={styles.sectionTitle}>Best Travelers</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.listContainer}>
              {travelers.map((traveler, index) => (
                <UserCard
                  key={index}
                  name="traveler"
                  score={traveler.score}
                  gender={traveler.user.profile.gender}
                  img={traveler.user.profile.image?.url ? traveler.user.profile.image.url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZlf5lc5tX-0gY-y94pGS0mQdL-D0lCH2OQ&s"}
                />
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={styles.sponsorsSection}>
          <ThemedText style={styles.sectionTitle}>Best Sponsors</ThemedText>
          <View style={styles.travelersSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.listContainer}>
                {sponsors.map((sponsor, index) => (
                  <UserCard
                    key={index}
                    name="sponsors"
                    score={sponsor.score}
                    gender={sponsor.user.profile.gender}
                    img={sponsor.user.profile.image?.url ? sponsor.user.profile.image.url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZlf5lc5tX-0gY-y94pGS0mQdL-D0lCH2OQ&s"}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
        <Notification />
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter custom message"
          value={customMessage}
          onChangeText={setCustomMessage}
        />
        <Button title="Send Notification" onPress={sendTestNotification} />
      </View>
=======
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: Colors[colorScheme].secondary },
            ]}
          >
            <Search color={Colors[colorScheme].text} size={20} />
            <TextInput
              placeholder="Search orders..."
              placeholderTextColor={Colors[colorScheme].text + "80"}
              style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            />
            <SlidersHorizontal color={Colors[colorScheme].text} size={20} />
          </View>
        </View>
      </ScrollView>
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
<<<<<<< HEAD
=======
  heroCard: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  heroText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  heroSubtext: {
    marginTop: 8,
    fontSize: 20,
    textAlign: "center",
    width: "100%",
  },
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
  servicesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "47%",
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
    backgroundColor: "rgba(0, 128, 152,0.8)",
    aspectRatio: 1,
    padding: 16,
    borderRadius: 12,
    borderColor: "white",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
=======
    aspectRatio: 1,
    padding: 16,
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
  },
  serviceContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
<<<<<<< HEAD
    color: "white"
  },
  travelersSection: {
    marginTop: 16,
    paddingVertical: 16,
  },
  listContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  sponsorsSection: {
    marginTop: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
=======
  },
  searchSection: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
>>>>>>> 1765ecfa99b276041f2c8b479981d78048c5ac32
  },
});
