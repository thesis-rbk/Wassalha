import { Text, View } from "react-native";
import Signup from "./signup";
import { User, Category, GoodsPost, GoodsProcess, Notification, Order, ProcessEvent, PromoPost, Reputation, ServiceProvider, Sponsorship, Subscription } from "../types/index";
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Signup />
    </View>
  );
}
