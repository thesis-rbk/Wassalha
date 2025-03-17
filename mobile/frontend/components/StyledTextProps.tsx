import React from "react";
import { Text, TextProps } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { StyledTextProps } from "@/types/StyledTextProps";

export function BodyMedium(props: StyledTextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const colorScheme = useColorScheme() ?? "light";
  const color = colorScheme === "dark" ? darkColor ?? Colors.dark.text : lightColor ?? Colors.light.text;

  return <Text style={[{ fontSize: 16, fontFamily: "Inter-Regular", color }, style]} {...otherProps} />;
}

export function TitleLarge(props: StyledTextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const colorScheme = useColorScheme() ?? "light";
  const color = colorScheme === "dark" ? darkColor ?? Colors.dark.text : lightColor ?? Colors.light.text;

  return <Text style={[{ fontSize: 24, fontFamily: "Inter-Bold", color }, style]} {...otherProps} />;
} 