import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Text } from 'react-native';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { TabBar } from '@/components/navigation/TabBar';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from 'react-native'; // Import Button
import { Search, Filter, Plane, ShoppingBag, MapPin, Crown, SlidersHorizontal } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';




export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { theme } = useTheme();

  // Add debug log for initial render
  console.log('HomeScreen rendered');
  // Use the useTheme hook

  const services = [
    {
      title: 'Travel',
      icon: <Plane size={32} color={Colors[colorScheme].primary} />,
      route: '../test/Travel' as const,
    },
    {
      title: 'Order',
      icon: <ShoppingBag size={32} color={Colors[colorScheme].primary} />,
      route: '../productDetails/create-order' as const,
    },
    {
      title: 'Pickup',
      icon: <MapPin size={32} color={Colors[colorScheme].primary} />,
      route: '../test/Pickup' as const,
    },
    {
      title: 'Subscription',
      icon: <Crown size={32} color={Colors[colorScheme].primary} />,
      route: '../test/Subscription' as const,
    },
  ];

  // Add debug log for services
  console.log('Services configured:', services);

  const handleCardPress = (service: typeof services[0]) => {
    console.log(`✅ handleCardPress triggered for: ${service.title}`);

    try {
      router.push(service.route);
      console.log(`✅ Navigation to ${service.route} attempted`);
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Navigation failed:`, err);
    }
  };



  return (

    <ThemedView style={styles.container}>
      <TopNavigation
        title="Wassalah"
        onMenuPress={() => { }}
        onNotificationPress={() => { }}
      />
      {/* <Button
        title="Log In"
        onPress={() => router.push('/auth/login')} // Navigate to /login
      /> */}

      <ScrollView style={styles.content}>
        {/* Hero Image Card */}
        <View style={styles.heroCard}>
          <Image
            source={require('@/assets/images/11.jpeg')}
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
        <View style={styles.servicesSection}>
          <ThemedText style={styles.sectionTitle}>Our Services</ThemedText>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <Card
                key={service.title}
                style={styles.serviceCard}
                onPress={() => handleCardPress(service)}
              // onPress={() => router.push(service.route)}
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

        {/* Login Button */}


        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme].secondary }]}>
            <Search color={Colors[colorScheme].text} size={20} />
            <TextInput
              placeholder="Search orders..."
              placeholderTextColor={Colors[colorScheme].text + '80'}
              style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            />
            <SlidersHorizontal color={Colors[colorScheme].text} size={20} />
          </View>
        </View>

        {/* Orders List Section */}
      </ScrollView>
      <TabBar
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
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
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  heroText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  heroSubtext: {
    marginTop: 8,
    fontSize: 20,
    textAlign: 'center',
    width: '100%',
  },
  servicesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '47%',
    aspectRatio: 1,
    padding: 16,
  },
  serviceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center', // Center the button horizontally
  },
  searchSection: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  ordersSection: {
    padding: 16,
  },
});