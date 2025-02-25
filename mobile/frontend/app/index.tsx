import { Text, View } from "react-native";
import Signup from "./signup";
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
