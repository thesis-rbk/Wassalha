import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import axiosInstance from '@/config';
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { TabBar } from "@/components/navigation/TabBar";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import UserCard from "@/components/fetchCards";
import {
  Plane,
  ShoppingBag,
  MapPin,
  Crown,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { Traveler } from "@/types/Traveler"
import { Notification } from "./Notification"
import axios from "axios";
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Home");
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [sponsors, setSponsors] = useState<Traveler[]>([])
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    handleBestTraveler();
  }, []);

  const handleBestTraveler = async () => {
    try {
      const result = await axiosInstance.get("/api/fecth/besttarveler");
      setTravelers(result.data.traveler);
      setSponsors(result.data.sponsor)
    } catch (err) {
      console.log("errrr", err);
    }
  };
  const services = [
    {
      title: "Travel",
      icon: <Plane size={40} color="white" />,
      route: "../test/Travel" as const,
    },
    {
      title: "Order",
      icon: <ShoppingBag size={40} color="white" />,
      route: "../test/order" as const,
    },
    {
      title: "Pickup",
      icon: <MapPin size={40} color="white" />,
      route: "../mapTrack" as const,
    },
    {
      title: "Subscription",
      icon: <Crown size={40} color="white" />,
      route: "../test/Subscription" as const,
    },
  ];

  const handleCardPress = (service: (typeof services)[0]) => {
    try {
      router.push(service.route);
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Navigation failed:`, err);
    }
  };

  return (

    <ThemedView style={styles.container}>
      {/* <View><AppNotification /></View> */}
      <TopNavigation
        title="Wassalha"
        onMenuPress={() => { }}
        onNotificationPress={() => { }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* <View style={styles.heroCard}>
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
        </View> */}

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
      </ScrollView>
      <Notification />
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
  heroCard: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  },
  heroSubtext: {
    marginTop: 8,
    fontSize: 20,
  },
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
    backgroundColor: "rgba(0, 128, 152,0.8)",
    aspectRatio: 1,
    padding: 16,
    borderRadius: 12, // Rounded corners for a modern look
    borderColor: "white",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // Increased offset for a deeper shadow
    shadowOpacity: 0.3, // Slightly more opaque shadow
    shadowRadius: 4, // Larger radius for a softer shadow
    elevation: 5, // Increased elevation for Android
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
});


{/* Search Section */ }
