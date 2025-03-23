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
  const scrollAnimationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track user interaction with scrolling
  const [userScrolling, setUserScrolling] = useState(false);
  
  // Track current scroll positions
  const [scrollPositions, setScrollPositions] = useState({
    travelers: 0,
    sponsors: 0
  });

  // Store content dimensions
  const [contentWidths, setContentWidths] = useState({
    travelers: 0,
    sponsors: 0
  });
  const [containerWidths, setContainerWidths] = useState({
    travelers: 0,
    sponsors: 0
  });

  useEffect(() => {
    handleBestTraveler();
    
    // Only start auto-scrolling if we have data
    if (travelers.length > 0 && sponsors.length > 0) {
      startAutoScroll();
    }

    return () => stopAutoScroll();
  }, [travelers.length, sponsors.length]);

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
    // Don't start auto-scroll if user is actively scrolling
    if (userScrolling) return;
    
    stopAutoScroll(); // Clear any existing interval

    scrollAnimationRef.current = setInterval(() => {
      if (!userScrolling && travelersScrollRef.current && travelers.length > 0) {
        const maxScrollX = Math.max(0, contentWidths.travelers - containerWidths.travelers);
        const newX = scrollPositions.travelers + 1;
        
        // Only scroll if we haven't reached the end
        if (newX < maxScrollX) {
          travelersScrollRef.current.scrollTo({ x: newX, animated: false });
          setScrollPositions(prev => ({...prev, travelers: newX}));
        } else {
          // Stop scrolling when reaching the end
          stopAutoScroll();
        }
      }
      
      if (!userScrolling && sponsorsScrollRef.current && sponsors.length > 0) {
        const maxScrollX = Math.max(0, contentWidths.sponsors - containerWidths.sponsors);
        const newX = scrollPositions.sponsors + 1;
        
        // Only scroll if we haven't reached the end
        if (newX < maxScrollX) {
          sponsorsScrollRef.current.scrollTo({ x: newX, animated: false });
          setScrollPositions(prev => ({...prev, sponsors: newX}));
        } else {
          // Stop scrolling when reaching the end
          stopAutoScroll();
        }
      }
    }, 50); // Adjust this value for scroll speed (smaller = faster)
  };

  const stopAutoScroll = () => {
    if (scrollAnimationRef.current) {
      clearInterval(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  };

  const handleUserScrollBegin = () => {
    setUserScrolling(true);
    stopAutoScroll();
  };

  const handleUserScrollEnd = () => {
    setUserScrolling(false);
    // Don't restart auto-scroll after user interaction
  };

  // Track scroll position changes
  const handleTravelersScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x } = event.nativeEvent.contentOffset;
    setScrollPositions(prev => ({...prev, travelers: x}));
  };

  const handleSponsorsScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x } = event.nativeEvent.contentOffset;
    setScrollPositions(prev => ({...prev, sponsors: x}));
  };

  const onTravelersLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidths(prev => ({ ...prev, travelers: width }));
  };

  const onSponsorsLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidths(prev => ({ ...prev, sponsors: width }));
  };

  const onTravelersContentSizeChange = (width: number) => {
    setContentWidths(prev => ({ ...prev, travelers: width }));
  };

  const onSponsorsContentSizeChange = (width: number) => {
    setContentWidths(prev => ({ ...prev, sponsors: width }));
  };

  const services = [
    {
      title: "Travel",
      icon: <Plane size={40} color="#007BFF" />,
      route: "../goodPost/goodpostpage" as const,
    },
    {
      title: "Order",
      icon: <ShoppingBag size={40} color="#007BFF" />,
      route: "../orders&requests/order" as const,
    },
    {
      title: "Pickup",
      icon: <MapPin size={40} color="#007BFF" />,
      route: "../pickup/PickupDashboard" as const,
    },
    {
      title: "Subscription",
      icon: <Crown size={40} color="#007BFF" />,
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
          <View style={styles.travelersSection} onLayout={onTravelersLayout}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={travelersScrollRef}
              onContentSizeChange={onTravelersContentSizeChange}
              onScrollBeginDrag={handleUserScrollBegin}
              onScrollEndDrag={handleUserScrollEnd}
              onScroll={handleTravelersScroll}
              scrollEventThrottle={16}
            >
              <View style={styles.listContainer}>
                {travelers.map((traveler, index) => (
                  <UserCard
                    key={`traveler-${index}`}
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
          <View style={styles.sponsorsSection} onLayout={onSponsorsLayout}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={sponsorsScrollRef}
              onContentSizeChange={onSponsorsContentSizeChange}
              onScrollBeginDrag={handleUserScrollBegin}
              onScrollEndDrag={handleUserScrollEnd}
              onScroll={handleSponsorsScroll}
              scrollEventThrottle={16}
            >
              <View style={styles.listContainer}>
                {sponsors.map((sponsor, index) => (
                  <UserCard
                    key={`sponsor-${index}`}
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
