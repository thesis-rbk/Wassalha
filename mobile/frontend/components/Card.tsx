import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Animated } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ChevronRight } from "lucide-react-native";
import { CardProps } from "@/types/CardProps";

// Use Animated for subtle press animations
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
  // Animation for press effect
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Handle press-in animation (scale down slightly)
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98, // Slightly scale down on press
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  // Handle press-out animation (scale back up)
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, // Scale back to original size
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === "dark" ? "#1C2526" : "#FFFFFF", // Dark mode support
          shadowColor: colorScheme === "dark" ? "#000" : "#4A4A4A", // Softer shadow color
          shadowOpacity: colorScheme === "dark" ? 0.4 : 0.2, // Adjusted shadow opacity
          transform: [{ scale: scaleAnim }], // Apply scale animation
        },
        style,
      ]}
    >
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                iconBackgroundColor ||
                (colorScheme === "dark" ? "#2A2E32" : "#F0F4F8"), // Solid background color instead of gradient
            },
          ]}
        >
          {React.cloneElement(icon as React.ReactElement, {
            color: colorScheme === "dark" ? "#66B2FF" : "#007AFF", // Adjust icon color for dark mode
            size: 20, // Slightly smaller icon for balance
          })}
        </View>
      )}
      <View style={styles.textContainer}>
        {title && (
          <Text
            style={[
              styles.title,
              { color: colorScheme === "dark" ? "#E0E0E0" : "#1A1A1A" }, // Better contrast for dark/light mode
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
    padding: 16, // Increased padding for better touch area
    borderRadius: 20, // Softer, more modern border radius
    borderWidth: 1, // Consolidated borderWidth (removed duplicate)
    borderColor: "rgba(0, 0, 0, 0.05)", // Subtle border for definition
    shadowOffset: {
      width: 0,
      height: 4, // Slightly larger shadow offset for depth
    },
    shadowRadius: 6, // Softer shadow spread
    elevation: 8, // Increased elevation for Android
    marginVertical: 6, // More vertical spacing between cards
    minWidth: "100%",
    height: 70, // Slightly taller for better readability
  },
  iconContainer: {
    width: 40, // Slightly larger for better visibility
    height: 40,
    borderRadius: 12, // Softer corners
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16, // Increased spacing for balance
  },
  textContainer: {
    flex: 1,
    justifyContent: "center", // Center the text vertically
  },
  title: {
    fontSize: 17, // Slightly larger for readability
    fontWeight: "500", // Medium weight for better hierarchy
  },
  chevronContainer: {
    marginLeft: "auto",
    justifyContent: "center", // Ensure chevron is vertically centered
  },
});