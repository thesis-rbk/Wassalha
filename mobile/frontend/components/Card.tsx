import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ChevronRight } from "lucide-react-native";
import { CardProps } from "@/types/CardProps";

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

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: 'white',
          shadowColor: colorScheme === "dark" ? "#000" : "#000",
          shadowOpacity: colorScheme === "dark" ? 0.5 : 0.25,
        },
        style,
      ]}
    >
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor || 'transparent' }]}>
          {React.cloneElement(icon as React.ReactElement, { color: '#007AFF' })}
        </View>
      )}
      <View style={styles.textContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
      </View>
      {showChevron && (
        <View style={styles.chevronContainer}>
          <ChevronRight color="#007BFF" size={24} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 0,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 4,
    minWidth: "100%",
    height: 60,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  chevronContainer: {
    marginLeft: "auto",
  },
});
