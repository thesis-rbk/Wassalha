import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
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

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Home");
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [sponsors, setSponsors] = useState<Traveler[]>([]);
  const router = useRouter();

  const travelersScrollRef = useRef<ScrollView>(null);
  const sponsorsScrollRef = useRef<ScrollView>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [travelerScrollX, setTravelerScrollX] = useState(0);
  const [sponsorScrollX, setSponsorScrollX] = useState(0);

  useEffect(() => {
    handleBestTraveler();
    startAutoScroll();

    return () => stopAutoScroll();
  }, [travelers, sponsors]);

  const handleBestTraveler = async () => {
    try {
      const result = await axiosInstance.get("/api/besttarveler");
      setTravelers(result.data.traveler);
      setSponsors(result.data.sponsor);
    } catch (err) {
      console.log("errrr", err);
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();

    const scrollStep = () => {
      [
        { ref: travelersScrollRef, position: travelerScrollX, setPosition: setTravelerScrollX },
        { ref: sponsorsScrollRef, position: sponsorScrollX, setPosition: setSponsorScrollX }
      ].forEach(({ ref, position, setPosition }) => {
        if (ref.current && contentWidth > containerWidth) {
          const scrollDistance = 2; // Adjusted scroll speed for smoother effect
          const newPosition = position + scrollDistance;

          ref.current.scrollTo({
            x: newPosition,
            animated: false,
          });

          // Reset when reaching half the content width (due to concatenation)
          if (newPosition >= contentWidth / 2) {
            ref.current.scrollTo({ x: 0, animated: false });
            setPosition(0);
          } else {
            setPosition(newPosition);
          }
        }
      });

      scrollAnimationRef.current = requestAnimationFrame(scrollStep);
    };

    scrollAnimationRef.current = requestAnimationFrame(scrollStep);
  };

  const stopAutoScroll = () => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  };

  const handleUserInteraction = () => {
    stopAutoScroll();
    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
    }
    userInteractionTimeoutRef.current = setTimeout(() => {
      startAutoScroll();
    }, 2000); // Resume auto-scroll after 2 seconds of inactivity
  };

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const onContentSizeChange = (contentWidth: number) => {
    setContentWidth(contentWidth);
  };

  const services = [
    {
      title: "Travel",
      icon: <Plane size={40} color="#007BFF" />,
      route: "../test/Travel" as const,
    },
    {
      title: "Order",
      icon: <ShoppingBag size={40} color="#007BFF" />,
      route: "../orders&requests/order" as const,
    },
    {
      title: "Pickup",
      icon: <MapPin size={40} color="white" />,
      route: "../pickup/PickupDashboard" as const,
    },
    {
      title: "Subscription",
      icon: <Crown size={40} color="#007BFF" />,
      route: "../verification/fetchAll" as const,
    },
    {
      title: "Traveler Posts",
      icon: <Crown size={40} color="white" />,
      route: "../goodPost/goodpostpage" as const,
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
      <TopNavigation
        title="Wassalha"
        onMenuPress={() => { }}
        onNotificationPress={() => { }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.servicesSection}>
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
        </View>

        {/* Best Travelers Section */}
        <View style={styles.section}>
          <View style={styles.separator}>
            <ThemedText style={styles.separatorText}>Best Travelers</ThemedText>
          </View>
          <View style={styles.travelersSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={travelersScrollRef}
              onLayout={onContainerLayout}
              onContentSizeChange={onContentSizeChange}
              onScrollBeginDrag={handleUserInteraction}
              onScrollEndDrag={handleUserInteraction}
            >
              <View style={styles.listContainer}>
                {travelers.concat(travelers).map((traveler, index) => (
                  <UserCard
                    key={index}
                    name={traveler.user.profile.name || "Traveler"}
                    score={traveler.score}
                    gender={traveler.user.profile.gender}
                    img={
                      traveler.user.profile.image?.url ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZlf5lc5tX-0gY-y94pGS0mQdL-D0lCH2OQ&s"
                    }
                    isVerified={true}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Best Sponsors Section */}
        <View style={styles.section}>
          <View style={styles.separator}>
            <ThemedText style={styles.separatorText}>Best Sponsors</ThemedText>
          </View>
          <View style={styles.sponsorsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={sponsorsScrollRef}
              onLayout={onContainerLayout}
              onContentSizeChange={onContentSizeChange}
              onScrollBeginDrag={handleUserInteraction}
              onScrollEndDrag={handleUserInteraction}
            >
              <View style={styles.listContainer}>
                {sponsors.concat(sponsors).map((sponsor, index) => (
                  <UserCard
                    key={index}
                    name={sponsor.user.profile.name || "Sponsor"}
                    score={sponsor.score}
                    gender={sponsor.user.profile.gender}
                    img={
                      sponsor.user.profile.image?.url ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZlf5lc5tX-0gY-y94pGS0mQdL-D0lCH2OQ&s"
                    }
                    isVerified={true}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 10,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  separatorText: {
    fontSize: 16,
    color: "#666",
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 8,
    zIndex: 1,
  },
  servicesSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center",
  },
  servicesGrid: {
    flexDirection: "column",
    gap: 10,
    justifyContent: "space-between",
    width: "100%",
  },
  serviceCard: {
    width: "100%",
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#ddd",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#007BFF",
  },
  travelersSection: {
    marginTop: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  listContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
  },
  sponsorsSection: {
    marginTop: 20,
    paddingVertical: 20,
    marginBottom: 80,
    alignItems: "center",
  },
});
