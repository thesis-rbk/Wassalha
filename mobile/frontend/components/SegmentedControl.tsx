import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface SegmentedControlProps {
  values: string[]; // Array of segment labels (e.g., ["Orders", "Requests"])
  selectedIndex: number; // Currently selected index
  onChange: (index: number) => void; // Callback when a segment is pressed
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  values,
  selectedIndex,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {values.map((value, index) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.segment,
            index === selectedIndex && styles.segmentActive,
          ]}
          onPress={() => onChange(index)}
        >
          <Text
            style={[
              styles.segmentText,
              index === selectedIndex && styles.segmentTextActive,
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
    marginVertical: 16,
  },
  segment: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: "#3b82f6", // Active segment background color
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b", // Inactive segment text color
  },
  segmentTextActive: {
    color: "white", // Active segment text color
  },
});

export default SegmentedControl;
