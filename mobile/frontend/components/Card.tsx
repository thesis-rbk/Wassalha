import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { ChevronRight, Plane, ShoppingBag, MapPin, Repeat } from "lucide-react-native";

// Simulated useColorScheme hook
const useColorScheme = () => "light";

// Simulated Colors constant
const Colors = {
  light: {
    background: "#F5F7FA",
    text: "#1A1A1A",
    primary: "#007AFF",
    secondary: "#66B2FF",
    cardBackground: "#FFFFFF",
    pressedBackground: "#E6F0FA",
    iconBackground: "#E6F0FA",
  },
  dark: {
    background: "#1C2526",
    text: "#E0E0E0",
    primary: "#66B2FF",
    secondary: "#007AFF",
    cardBackground: "#2A2E32",
    pressedBackground: "#3A3E42",
    iconBackground: "#3A3E42",
  },
};

// CardProps type
type CardProps = {
  onPress: () => void;
  children?: React.ReactNode;
  style?: any;
  icon?: React.ReactElement;
  title?: string;
  iconBackgroundColor?: string;
  showChevron?: boolean;
};

// Card Component
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Card({
  onPress,
  children,
  style,
  icon,
  title,
  iconBackgroundColor,
  showChevron = false,
}: CardProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const backgroundAnim = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        friction: 10,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 10,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      colorScheme === "dark" ? Colors.dark.cardBackground : Colors.light.cardBackground,
      colorScheme === "dark" ? Colors.dark.pressedBackground : Colors.light.pressedBackground,
    ],
  });

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor,
          shadowColor: colorScheme === "dark" ? "#000" : "#4A4A4A",
          shadowOpacity: colorScheme === "dark" ? 0.3 : 0.15,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={`card-${title?.toLowerCase()}`}
    >
      {/* Icon */}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: iconBackgroundColor || Colors[colorScheme].iconBackground,
            },
          ]}
        >
          {React.cloneElement(icon as React.ReactElement, {
            color: iconBackgroundColor ? "#FFFFFF" : Colors[colorScheme].primary,
            size: 28,
          })}
        </View>
      )}

      {/* Title (Explicitly below the icon) */}
      {title && (
        <Text
          style={[
            styles.title,
            { color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text },
          ]}
        >
          {title}
        </Text>
      )}

      {/* Children */}
      {children && (
        <View style={styles.childrenContainer}>
          {typeof children === "string" ? (
            <Text style={[styles.childrenText, { color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text }]}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}

      {/* Chevron */}
      {showChevron && (
        <View style={styles.chevronContainer}>
          <ChevronRight
            color={colorScheme === "dark" ? Colors.dark.secondary : Colors.light.primary}
            size={20}
          />
        </View>
      )}
    </AnimatedTouchable>
  );
}

// HomeScreen Component
export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === "dark" ? Colors.dark.background : Colors.light.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: "white" }]}>Home</Text>
      </View>

      {/* Card Grid */}
      <View style={styles.cardGrid}>
        <Card
          title="Travel"
          icon={<Plane />}
          onPress={() => console.log("Travel pressed")}
        />
        <Card
          title="Order"
          icon={<ShoppingBag />}
          onPress={() => console.log("Order pressed")}
        />
        <Card
          title="Pickup"
          icon={<MapPin />}
          onPress={() => console.log("Pickup pressed")}
        />
        <Card
          title="Subscription"
          icon={<Repeat />}
          onPress={() => console.log("Subscription pressed")}
        />
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const cardSize = (width - 48) / 2; // Adjusted for padding and gap

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#007BFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  // Card Grid
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
    gap: 20,
  },

  // Card Styles
  card: {
    flexDirection: "column", // Ensure vertical stacking
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 16,
    borderWidth: 0,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 0.15,
    elevation: 4,
    width: cardSize,
    height: cardSize,
    backgroundColor: "#FFFFFF",
  },

  // Icon Container
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12, // Space between icon and title
  },

  // Title Styles
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Children Container
  childrenContainer: {
    marginTop: 10,
  },

  // Children Text Styles
  childrenText: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
  },

  // Chevron Container
  chevronContainer: {
    marginTop: 10,
  },
});