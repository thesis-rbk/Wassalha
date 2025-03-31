"use client"

import React from 'react'
import { useEffect, useState, useRef } from "react"
import {
  Dimensions,
  View,
  StyleSheet,
  ScrollView,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native"
import axiosInstance from "@/config"
import { TopNavigation } from "@/components/navigation/TopNavigation"
import { TabBar } from "@/components/navigation/TabBar"
import { ThemedView } from "@/components/ThemedView"
import { ThemedText } from "@/components/ThemedText"
import { Card } from "@/components/Card"
import UserCard from "@/components/fetchCards"
import OrderCard from "@/components/cardsForHomePage"
import { Plane, ShoppingBag, MapPin, Crown, ChevronRight } from "lucide-react-native"
import { useRouter } from "expo-router"
import type { Traveler } from "@/types/Traveler"
import type { Order } from "@/types/Sponsorship"
import { useSelector } from 'react-redux'
import { LinearGradient } from 'expo-linear-gradient'
import { UserData } from '@/types/UserData'
import { UserProfile } from '@/types/UserProfile'

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Home")
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [sponsors, setSponsors] = useState<Traveler[]>([])
  const [requests, setRequests] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const router = useRouter()
  const { user } = useSelector((state: any) => state.auth)
  const travelersScrollRef = useRef<ScrollView>(null)
  const sponsorsScrollRef = useRef<ScrollView>(null)
  const scrollAnimationRef = useRef<NodeJS.Timeout | null>(null)

  const [userScrolling, setUserScrolling] = useState(false)
  const [scrollPositions, setScrollPositions] = useState({
    travelers: 0,
    sponsors: 0,
  })
  const [contentWidths, setContentWidths] = useState({
    travelers: 0,
    sponsors: 0,
  })
  const [containerWidths, setContainerWidths] = useState({
    travelers: 0,
    sponsors: 0,
  })

  const fetchData = async (pageNum: number) => {
    try {
      const response = await axiosInstance.get(`/api/requests/?page=${pageNum}&limit=3`)
      const newRequests = response.data.data
      console.log(`Fetched page ${pageNum}:`, newRequests)
      setRequests((prev) => [...prev, ...newRequests])
      setHasMore(newRequests.length > 0 && newRequests.length === 3)
    } catch (error) {
      console.log("Error fetching requests:", error)
      setHasMore(false)
    }
  }

  const fetchRecentUsers = async () => {
    try {
      const usersResponse = await axiosInstance.get('/api/users');
      const users = (usersResponse.data.data || []) as UserData[];
      setRecentUsers(users.map((user: UserData): UserProfile => ({
        id: user.id,
        name: user.profile?.firstName || user.name,
        imageUrl: user.profile?.image?.url || null
      })));
    } catch (error) {
      console.error('Error fetching recent users:', error);
    }
  };

  useEffect(() => {
    fetchRecentUsers();
    handleBestTraveler();
    fetchData(1);

    if (travelers.length > 0 && sponsors.length > 0) {
      startAutoScroll()
    }

    return () => stopAutoScroll()
  }, [travelers.length, sponsors.length])

  const handleBestTraveler = async () => {
    try {
      const result = await axiosInstance.get("/api/besttarveler")
      setTravelers(result.data.traveler)
      setSponsors(result.data.sponsor)
    } catch (err) {
      console.log("Error fetching best travelers:", err)
    }
  }

  const startAutoScroll = () => {
    if (userScrolling) return

    stopAutoScroll()

    scrollAnimationRef.current = setInterval(() => {
      if (!userScrolling && travelersScrollRef.current && travelers.length > 0) {
        const maxScrollX = Math.max(0, contentWidths.travelers - containerWidths.travelers)
        const newX = scrollPositions.travelers + 1
        if (newX < maxScrollX) {
          travelersScrollRef.current.scrollTo({ x: newX, animated: false })
          setScrollPositions((prev) => ({ ...prev, travelers: newX }))
        }
      }

      if (!userScrolling && sponsorsScrollRef.current && sponsors.length > 0) {
        const maxScrollX = Math.max(0, contentWidths.sponsors - containerWidths.sponsors)
        const newX = scrollPositions.sponsors + 1
        if (newX < maxScrollX) {
          sponsorsScrollRef.current.scrollTo({ x: newX, animated: false })
          setScrollPositions((prev) => ({ ...prev, sponsors: newX }))
        }
      }
    }, 50)
  }

  const stopAutoScroll = () => {
    if (scrollAnimationRef.current) {
      clearInterval(scrollAnimationRef.current)
      scrollAnimationRef.current = null
    }
  }

  const handleUserScrollBegin = () => {
    setUserScrolling(true)
    stopAutoScroll()
  }

  const handleUserScrollEnd = () => {
    setUserScrolling(false)
  }

  const handleTravelersScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x } = event.nativeEvent.contentOffset
    setScrollPositions((prev) => ({ ...prev, travelers: x }))
  }

  const handleSponsorsScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x } = event.nativeEvent.contentOffset
    setScrollPositions((prev) => ({ ...prev, sponsors: x }))
  }

  const onTravelersLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    setContainerWidths((prev) => ({ ...prev, travelers: width }))
  }

  const onSponsorsLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    setContainerWidths((prev) => ({ ...prev, sponsors: width }))
  }

  const onTravelersContentSizeChange = (width: number) => {
    setContentWidths((prev) => ({ ...prev, travelers: width }))
  }

  const onSponsorsContentSizeChange = (width: number) => {
    setContentWidths((prev) => ({ ...prev, sponsors: width }))
  }

  const services = [
    {
      title: "Travel",
      description: "Turn your travels into earnings. Get paid to deliver items while exploring new destinations.",
      icon: <Plane size={40} color="#007BFF" />,
      route: "../goodPost/goodpostpage" as const,
    },
    {
      title: "Order",
      description: "Shop globally, save locally. Get up to 40% off on international products with trusted travelers.",
      icon: <ShoppingBag size={40} color="#007BFF" />,
      route: "../orders&requests/order" as const,
    },
    {
      title: "Pickup",
      description: "Choose your convenient pickup spot. Flexible delivery locations that work around your schedule.",
      icon: <MapPin size={40} color="#007BFF" />,
      route: "../pickup/PickupDashboard" as const,
    },
    {
      title: "Subscription",
      description: "Unlock premium benefits. Get priority access, reduced fees, and exclusive shopping deals.",
      icon: <Crown size={40} color="#007BFF" />,
      route: "../verification/fetchAll" as const,
    },
  ]

  const handleCardPress = (service: (typeof services)[0]) => {
    try {
      router.push(service.route)
    } catch (error) {
      const err = error as Error
      console.error(`❌ Navigation failed:`, err)
    }
  }

  const handleOrderCardPress = (requestId: number) => {
    // router.push(`/request/${requestId}`) // Navigate to request details
  }

  const handleAcceptRequest = (requestId: number) => {
    console.log(`Accepted request ${requestId}`)
    // Add your accept logic here (e.g., API call)
  }

  const handleRejectRequest = (requestId: number) => {
    console.log(`Rejected request ${requestId}`)
    // Add your reject logic here (e.g., API call)
  }

  const handleSeeMoreRequests = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchData(nextPage)
  }

  // New function to handle clicking on a traveler or sponsor card
  const handleUserCardPress = (name: string, role: "Traveler" | "Sponsor") => {
    Alert.alert(
      "Premium Feature",
      `You need to be a premium member to contact ${role}s like ${name}. Upgrade your account to unlock this feature!`,
      [
        {
          text: "OK",
          style: "default",
        },
      ],
      { cancelable: true }
    )
  }

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === "create") {
      router.push("/verification/CreateSponsorPost");
    } else {
      router.push(tabName as any);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TopNavigation title="Wassalha" onNotificationPress={() => { }} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeTitle}>Hi {user?.name || 'there'},</ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            100K+ shoppers around the world have saved 40% or more by shopping with Grabr. 2 weeks approximate delivery time.
          </ThemedText>
          <View style={styles.avatarRow}>
            {recentUsers.slice(0, 10).map((user, index) => (
              <View 
                key={index} 
                style={[
                  styles.avatarContainer,
                  { marginLeft: index > 0 ? -15 : 0, zIndex: 10 - index }
                ]}
              >
                {user.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <ThemedText style={styles.avatarInitial}>
                      {user.name?.charAt(0) || '?'}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}
            <View style={[styles.avatarMore, { marginLeft: -15, zIndex: 0 }]}>
              <ThemedText style={styles.avatarMoreText}>+100K</ThemedText>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.orderButton}
            onPress={() => router.push("/productDetails/create-order")}
          >
            <ThemedText style={styles.orderButtonText}>I'm ready to start my order</ThemedText>
            <ChevronRight size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.servicesSection}>
            <ThemedText style={styles.servicesTitle}>Our Services</ThemedText>
            <ThemedText style={styles.servicesDescription}>
              Discover how we make global shopping and travel rewards work for you
            </ThemedText>
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.title}
                  style={styles.serviceCard}
                  onPress={() => handleCardPress(service)}
                >
                  <View style={styles.serviceContent}>
                    <LinearGradient
                      colors={['#007BFF', '#00A3FF']}
                      style={styles.serviceIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {React.cloneElement(service.icon, { size: 24, color: '#fff' })}
                    </LinearGradient>
                    <View style={styles.serviceTextContainer}>
                      <ThemedText style={styles.serviceTitle}>{service.title}</ThemedText>
                      <ThemedText style={styles.serviceDescription}>
                        {service.description}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
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
                    name={traveler.user.profile.firstName}
                    score={traveler.score}
                    gender={traveler.user.profile.gender}
                    img={
                      traveler.user.profile.image?.url ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZlf5lc5tX-0gY-y94pGS0mQdL-D0lCH2OQ&s"
                    }
                    isVerified={true}
                    role="Traveler"
                    onPress={() => handleUserCardPress(traveler.user.profile.firstName, "Traveler")} // Add onPress handler
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
                    name={sponsor.user.profile.firstName}
                    score={sponsor.score}
                    gender={sponsor.user.profile.gender}
                    img={
                      sponsor.user.profile.image?.url ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZlf5lc5tX-0gY-y94pGS0mQdL-D0lCH2OQ&s"
                    }
                    isVerified={true}
                    role="Sponsor"
                    onPress={() => handleUserCardPress(sponsor.user.profile.firstName, "Sponsor")} // Add onPress handler
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Requests Section */}
        <View style={styles.section}>
          <View style={styles.separator}>
            <ThemedText style={styles.separatorText}>Latest Requests</ThemedText>
          </View>
          <View style={styles.requestsSection}>
            {requests.length > 0 ? (
              <>
                {requests.map((request, index) => (
                  <OrderCard
                    key={`request-${index}`}
                    order={request as any}
                    onPress={() => handleOrderCardPress(request.id)}
                  />
                ))}
                {hasMore && (
                  <TouchableOpacity onPress={handleSeeMoreRequests}>
                    <ThemedText style={styles.seeMoreText}>See More</ThemedText>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>No requests available</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </ThemedView>
  )
}

const { width } = Dimensions.get("window")
const cardSize = (width - 48) / 2

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
    paddingVertical: 16,
  },
  servicesTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  servicesDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  servicesGrid: {
    width: "100%",
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  travelersSection: {
    marginTop: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  sponsorsSection: {
    marginTop: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  requestsSection: {
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  listContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
    justifyContent: "center",
  },
  emptyState: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderColor: "#ddd",
    borderWidth: 0.5,
  },
  emptyStateText: {
    color: "#999",
    fontSize: 14,
  },
  seeMoreText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  welcomeSection: {
    backgroundColor: "#007BFF",
    padding: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007BFF",
  },
  avatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarMoreText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  orderButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007BFF",
  },
})