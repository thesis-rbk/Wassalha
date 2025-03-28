import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from "react-native";

interface SegmentedControlProps {
  values: string[]; // Array of segment labels (e.g., ["Orders", "Requests"])
  selectedIndex: number; // Currently selected index
  onChange: (index: number) => void; // Callback when a segment is pressed
  style?: ViewStyle; // Optional style prop for the container
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  values,
  selectedIndex,
  onChange,
  style, // Optional container style
}) => {
  // Ensure values are strings and that selectedIndex is valid
  const safeValues = values.map(String); // Ensure all values are strings
  const safeSelectedIndex = selectedIndex >= 0 && selectedIndex < safeValues.length ? selectedIndex : 0;

  return (
    <View style={[styles.container, style]}>
      {safeValues.map((value, index) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.segment,
            index === safeSelectedIndex && styles.segmentActive, // Apply active styles
          ]}
          onPress={() => onChange(index)} // Handle segment press
        >
          <Text
            style={[
              styles.segmentText,
              index === safeSelectedIndex && styles.segmentTextActive, // Change text style when active
            ]}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Arrange segments horizontally
    justifyContent: "center", // Center the segments
    alignItems: "center", // Align items vertically
    backgroundColor: "#f0f0f0", // Light background color
    borderRadius: 8, // Rounded corners for the container
    padding: 4, // Padding around the segments
    marginVertical: 16, // Vertical spacing
  },
  segment: {
    flex: 1, // Make each segment take equal space
    justifyContent: "center", // Center the content within each segment
    alignItems: "center", // Center the text within the segment
    paddingVertical: 8, // Vertical padding inside each segment
    borderRadius: 6, // Rounded corners for each segment
  },
  segmentActive: {
    backgroundColor: "#3b82f6", // Active segment background color
  },
  segmentText: {
    fontSize: 14, // Font size for the segment text
    fontWeight: "500", // Medium font weight for the text
    color: "#64748b", // Inactive segment text color
  },
  segmentTextActive: {
    color: "white", // Active segment text color (white)
  },
});

export default SegmentedControl;
