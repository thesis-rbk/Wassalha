import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Animated } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ChevronRight } from "lucide-react-native";
import { CardProps } from "@/types/CardProps";

// Use Animated for press animations
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Card({
  onPress,
  children,
  style,
  icon,
  title,
  iconBackgroundColor,
  showChevron = true,
}: CardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const backgroundAnim = React.useRef(new Animated.Value(0)).current; // For background color change on press

  // Handle press-in animation (scale down + background change)
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95, // Slightly more pronounced scale down
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1, // Trigger background color change
        duration: 150,
        useNativeDriver: false, // Background color animations don't support native driver
      }),
    ]).start();
  };

  // Handle press-out animation (scale back up + reset background)
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Interpolate background color for press effect
  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      colorScheme === "dark" ? "#1C2526" : "#FFFFFF", // Default background
      colorScheme === "dark" ? "#2A2E32" : "#F0F4F8", // Pressed background
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
          backgroundColor, // Animated background color
          shadowColor: colorScheme === "dark" ? "#000" : "#4A4A4A",
          shadowOpacity: colorScheme === "dark" ? 0.4 : 0.2,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
      accessibilityRole="button" // Improve accessibility
      accessibilityLabel={title} // Add label for screen readers
    >
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: iconBackgroundColor || (colorScheme === "dark" ? "#2A2E32" : "#F0F4F8"),
              // Add a subtle gradient (you can use a library like `react-native-linear-gradient` for this)
            },
          ]}
        >
          {React.cloneElement(icon as React.ReactElement, {
            color: iconBackgroundColor ? "#FFFFFF" : (colorScheme === "dark" ? "#66B2FF" : "#007AFF"),
            size: 24, // Larger icon for better visibility
          })}
        </View>
      )}
      <View style={styles.textContainer}>
        {title && (
          <Text
            style={[
              styles.title,
              { color: colorScheme === "dark" ? "#E0E0E0" : "#1A1A1A" },
            ]}
          >
            {title}
          </Text>
        )}
        {children}
      </View>
      {showChevron && (
        <View style={styles.chevronContainer}>
          <ChevronRight
            color={colorScheme === "dark" ? "#66B2FF" : "#007BFF"}
            size={24}
          />
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20, // Increased padding for better touch area
    borderRadius: 24, // Softer, more modern border radius
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: {
      width: 0,
      height: 6, // Larger shadow for more depth
    },
    shadowRadius: 8,
    elevation: 10, // Increased elevation for Android
    marginVertical: 8, // More spacing between cards
    minWidth: "100%",
    height: 80, // Taller card for better readability
  },
  iconContainer: {
    width: 48, // Larger icon container
    height: 48,
    borderRadius: 16, // Softer corners
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20, // More spacing between icon and text
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 18, // Larger font for better readability
    fontWeight: "600", // Bolder for better hierarchy
  },
  subtitle: {
    fontSize: 14, // Smaller font for subtitle
    fontWeight: "400",
    marginTop: 2, // Spacing between title and subtitle
  },
  chevronContainer: {
    marginLeft: "auto",
    justifyContent: "center",
  },
});