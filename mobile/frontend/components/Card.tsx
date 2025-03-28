"use client"

import React from "react"
import { View, StyleSheet, TouchableOpacity, Text, Animated } from "react-native"

// CardProps type
type CardProps = {
  onPress: () => void
  children?: React.ReactNode
  style?: any
  icon?: React.ReactElement
  title?: string
  iconBackgroundColor?: string
  showChevron?: boolean
}

// Card Component
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export function Card({ onPress, children, style, icon, title, iconBackgroundColor, showChevron = false }: CardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current
  const backgroundAnim = React.useRef(new Animated.Value(0)).current

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
    ]).start()
  }

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
    ]).start()
  }

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", "#F5F7FA"],
  })

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
      testID={`card-${title?.toLowerCase()}`}
    >
      {children ? (
        children
      ) : (
        <View style={styles.contentContainer}>
          {/* Icon */}
          {icon && (
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: iconBackgroundColor || "transparent",
                },
              ]}
            >
              {React.cloneElement(icon as React.ReactElement, {
                color: "#007BFF",
                size: 40,
              })}
            </View>
          )}

          {/* Title */}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#ddd",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 0.15,
    elevation: 4,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#007BFF",
  },
})

