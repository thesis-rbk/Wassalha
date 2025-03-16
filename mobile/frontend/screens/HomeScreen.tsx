import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Button,
} from "react-native";
import axiosInstance from "@/config";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { TabBar } from "@/components/navigation/TabBar";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import UserCard from "@/components/fetchCards";
import { Plane, ShoppingBag, MapPin, Crown } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Traveler } from "@/types/Traveler";
// Import the NotificationItem component

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Home");
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [sponsors, setSponsors] = useState<Traveler[]>([]);
  const [notifications, setNotifications] = useState<
    { message: string; timestamp: number }[]
  >([]);
  const [customMessage, setCustomMessage] = useState<string>("");
  const router = useRouter();

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

  const services = [
    {
      title: "Travel",
      icon: <Plane size={40} color="white" />,
      route: "../test/Travel" as const,
    },
    {
      title: "Order",
      icon: <ShoppingBag size={40} color="white" />,
      route: "../orders&requests/order" as const,
    },
    {
      title: "Pickup",
      icon: <MapPin size={40} color="white" />,
      route: "../pickup/pickup" as const,
    },
    {
      title: "Subscription",
      icon: <Crown size={40} color="white" />,
      route: "../verification/fetchAll" as const,
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

  const sendTestNotification = () => {
    setNotifications((prev) => [
      ...prev,
      { message: customMessage, timestamp: Date.now() },
    ]);
    setCustomMessage("");
  };

  return (
    <ThemedView style={styles.container}>
      <TopNavigation
        title="Wassalha"
        onMenuPress={() => {}}
        onNotificationPress={() => {}}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                  img={
                    traveler.user.profile.image?.url
                      ? traveler.user.profile.image.url
                      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZlf5lc5tX-0gY-y94pGS0mQdL-D0lCH2OQ&s"
                  }
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
                    img={
                      sponsor.user.profile.image?.url
                        ? sponsor.user.profile.image.url
                        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZlf5lc5tX-0gY-y94pGS0mQdL-D0lCH2OQ&s"
                    }
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
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
    borderRadius: 12,
    borderColor: "white",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    color: "white",
  },
  travelersSection: {
    marginTop: 16,
    paddingVertical: 16,
  },
  listContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
  },
  sponsorsSection: {
    marginTop: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
});
