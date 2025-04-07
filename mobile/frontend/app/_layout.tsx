import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store";
import "../styles/global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import MainLoading from "@/components/MainLoading";
import { StripeProvider } from "@stripe/stripe-react-native";
import { STRIPE_PUBLISHABLE_KEY } from "@/config";
import { NotificationProvider } from "@/context/NotificationContext";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { SponsorshipProcessProvider } from "@/context/SponsorshipProcessContext";
import { OnboardingContainer } from '@/components/onboarding';
import { OnboardingService } from '@/services/onboardingService';
import { ProcessSocketProvider } from "@/context/ProcessSocketContext";
import { StatusProvider } from "@/context/StatusContext";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});
  const [animationComplete, setAnimationComplete] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
    checkOnboardingStatus();
  }, [fontsLoaded]);

  const checkOnboardingStatus = async () => {
    const seen = await OnboardingService.hasSeenOnboarding();
    setHasSeenOnboarding(seen);
  };

  const handleOnboardingComplete = async () => {
    await OnboardingService.setOnboardingComplete();
    setHasSeenOnboarding(true);
  };

  if (!fontsLoaded) {
    return null;
  }

  console.log("Store:", store);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <AuthProvider>
          <ThemeProvider>
            <ProcessSocketProvider>
              <StatusProvider>

                <SponsorshipProcessProvider>
                  <StripeProvider
                    publishableKey={STRIPE_PUBLISHABLE_KEY}
                    urlScheme="wassalha"
                    merchantIdentifier="merchant.com.wassalha"
                  >
                    {!loadingComplete ? (
                      <MainLoading
                        onLoadingComplete={() => setLoadingComplete(true)}
                      />
                    ) : !animationComplete ? (
                      <WelcomeAnimation
                        onAnimationComplete={() => setAnimationComplete(true)}
                      />
                    ) : hasSeenOnboarding === null ? (
                      <MainLoading
                        onLoadingComplete={() => setHasSeenOnboarding(false)}
                      />
                    ) : !hasSeenOnboarding ? (
                      <OnboardingContainer
                        onComplete={handleOnboardingComplete}
                      />
                    ) : (
                      <Stack screenOptions={{ headerShown: false }}>
                        {/* Auth screens with no headers */}
                        <Stack.Screen
                          name="auth/signup"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="auth/login"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen name="home" />
                        <Stack.Screen
                          name="auth/ResetPassword"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="auth/NewPassword"
                          options={{ headerShown: false }}
                        />

                        {/* Rest of the screens with normal headers */}
                        <Stack.Screen
                          name="productDetails"
                          options={{
                            title: "Product Details",
                          }}
                        />
                        <Stack.Screen
                          name="test/Subscription"
                          options={{ title: "Subscription" }}
                        />
                        <Stack.Screen
                          name="onboarding/howYouHeard"
                          options={{ title: "How You Heard" }}
                        />
                        <Stack.Screen
                          name="onboarding/selectCategories"
                          options={{ title: "Select Categories" }}
                        />
                        <Stack.Screen
                          name="onboarding/customScreen"
                          options={{ title: "Custom Screen" }}
                        />
                        <Stack.Screen
                          name="profile/change"
                          options={{ title: "Change Password" }}
                        />
                        <Stack.Screen
                          name="profile/edit"
                          options={{ title: "Edit Profile" }}
                        />
                        <Stack.Screen
                          name="profile/index"
                          options={{ title: "Profile" }}
                        />
                        <Stack.Screen
                          name="messages/messages"
                          options={{ title: "Messages" }}
                        />
                        <Stack.Screen
                          name="test/Terms&&Conditions"
                          options={{ title: "terms n conditions", headerShown: false }}
                        />
                        <Stack.Screen
                          name="test/Travel"
                          options={{ title: "Travel" }}
                        />
                        <Stack.Screen
                          name="test/Pickup"
                          options={{ title: "Pickup" }}
                        />
                        <Stack.Screen
                          name="test/chat"
                          options={{ title: "Chat" }}
                        />
                        <Stack.Screen
                          name="verification/start"
                          options={{ title: "verification" }}
                        />
                        <Stack.Screen
                          name="verification/TakeSelfie"
                          options={{ title: "Take Selfie" }}
                        />
                        <Stack.Screen
                          name="verification/CreditCardVerification"
                          options={{ title: "Credit Card Verification" }}
                        />
                        <Stack.Screen
                          name="orders&requests/order"
                          options={{ title: "Orders & Requests" }}
                        />
                        <Stack.Screen
                          name="processTrack/initializationSO"
                          options={{ title: "Initialization" }}
                        />
                        <Stack.Screen
                          name="verification/SponsorRequestst"
                          options={{ title: "requests" }}
                        />
                        <Stack.Screen
                          name="verification/ClientsOrders"
                          options={{ title: "client orders" }}
                        />
                        <Stack.Screen
                          name="processTrack/initializationSP"
                          options={{ title: "Initialization" }}
                        />
                        <Stack.Screen
                          name="processTrack/verificationSO"
                          options={{ title: "Verification" }}
                        />
                        <Stack.Screen
                          name="processTrack/verificationSP"
                          options={{ title: "Verification" }}
                        />
                        <Stack.Screen
                          name="processTrack/paymentSO"
                          options={{ title: "Payment" }}
                        />
                        <Stack.Screen
                          name="processTrack/paymentSP"
                          options={{ title: "Payment" }}
                        />
                        <Stack.Screen
                          name="processTrack/pickupSO"
                          options={{ title: "Pickup" }}
                        />
                        <Stack.Screen
                          name="processTrack/pickupSP"
                          options={{ title: "Pickup" }}
                        />
                        <Stack.Screen name="test/order-details" />
                        <Stack.Screen
                          name="processTrack/makeOffer"
                          options={{ title: "Make Offer" }}
                        />

                        {/* Add the new success screens */}
                        <Stack.Screen
                          name="screens/RequestSuccessScreen"
                          options={{
                            title: "Request Created",
                          }}
                        />
                        <Stack.Screen
                          name="screens/OrderSuccessScreen"
                          options={{
                            title: "Order Created",
                          }}
                        />
                        <Stack.Screen
                          name="verification/fetchAll"
                          options={{ title: "Fetch Sub" }}
                        />
                        <Stack.Screen
                          name="verification/Wallet"
                          options={{ title: "Wallet" }}
                        />
                        <Stack.Screen
                          name="verification/SponsorshipDetails"
                          options={{ title: "verif details" }}
                        />
                        <Stack.Screen
                          name="verification/CreateSponsorPost"
                          options={{ title: "Create Sponsor Post" }}
                        />
                        <Stack.Screen
                          name="reporting-system/create-ticket"
                          options={{ title: "Create Report" }}
                        />
                        <Stack.Screen
                          name="goodPost/goodpostpage"
                          options={{ title: "Traveler Posts" }}
                        />
                        <Stack.Screen
                          name="goodPost/createGoodsPost"
                          options={{ title: "Create Goods Post" }}
                        />
                        <Stack.Screen
                          name="traveler/becomeTraveler"
                          options={{ title: "Become Traveler" }}
                        />
                        <Stack.Screen
                          name="screens/NotificationsScreen"
                          options={{
                            headerShown: false
                          }}
                        />
                        <Stack.Screen
                          name="orders&requests/allPendingRequests"
                          options={{ title: "allPendingRequests" }}
                        />
                        <Stack.Screen
                          name="sponsorshipTrack/initializationBuyer"
                          options={{ title: "Sponsorship Details" }}
                        />
                        <Stack.Screen
                          name="sponsorshipTrack/verificationBuyer"
                          options={{ title: "Verification" }}
                        />
                        <Stack.Screen
                          name="sponsorshipTrack/paymentBuyer"
                          options={{ title: "Payment" }}
                        />
                        <Stack.Screen
                          name="sponsorshipTrack/deliveryBuyer"
                          options={{ title: "Delivery" }}
                        />

                        <Stack.Screen
                          name="sponsorshipTrack/initializationSponsor"
                          options={{ title: "Sponsorship Details" }}
                        />
                        <Stack.Screen
                          name="sponsorshipTrack/verificationSponsor"
                          options={{ title: "Verification" }}
                        />
                        <Stack.Screen
                          name="sponsorshipTrack/paymentSponsor"
                          options={{ title: "Payment" }}
                        />
                        <Stack.Screen
                          name="sponsorshipTrack/deliverySponsor"
                          options={{ title: "Delivery" }}
                        />
                        <Stack.Screen
                          name="pickup/PickupDashboard"
                          options={{ title: "Pickup" }}
                        />
                        <Stack.Screen
                          name="reporting-system/MyTicketsPage"

                        />
                        <Stack.Screen
                          name="reporting-system/detailsTicket/[id]"
                          options={{ title: "Ticket " }}

                        />
                      </Stack>

                    )}
                  </StripeProvider>
                </SponsorshipProcessProvider>
              </StatusProvider>
            </ProcessSocketProvider>
          </ThemeProvider>
        </AuthProvider>

      </NotificationProvider>
    </Provider>
  );
}