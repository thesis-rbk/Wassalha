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
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});
  const [animationComplete, setAnimationComplete] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  console.log("Store:", store);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <AuthProvider>
          <ThemeProvider>
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
                ) : (
                  <Stack>
                    {/* Optionally define specific screens if needed */}
                    <Stack.Screen
                      name="auth/signup"
                      options={{ title: "Sign Up" }}
                    />
                    <Stack.Screen
                      name="auth/login"
                      options={{ title: "Log In" }}
                    />
                    <Stack.Screen name="home" />
                    <Stack.Screen
                      name="auth/ResetPassword"
                      options={{ title: "Reset Password" }}
                    />
                    <Stack.Screen
                      name="auth/NewPassword"
                      options={{ title: "New Password" }}
                    />
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
                      options={{ title: "terms n conditions" }}
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
                      name="verification/creditCardVerification"
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
                        title: "Notifications",
                      }}
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
                  </Stack>

                )}
              </StripeProvider>
            </SponsorshipProcessProvider>
          </ThemeProvider>
        </AuthProvider>
      </NotificationProvider>
    </Provider>
  );
}
