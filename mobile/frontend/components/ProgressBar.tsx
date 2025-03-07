import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Clock, DollarSign, MapPin, Package } from "lucide-react-native";
import { ProgressBarProps } from "@/types/ProgressBarProps";

export default function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  const renderIcon = (
    icon: string,
    isActive: boolean,
    isCompleted: boolean
  ) => {
    const color = isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#94a3b8";
    const size = 20;

    switch (icon) {
      case "initialization":
        return <Package size={size} color={color} />;
      case "verification":
        return <Check size={size} color={color} />;
      case "payment":
        return <DollarSign size={size} color={color} />;
      case "pickup":
        return <MapPin size={size} color={color} />;
      default:
        return <Clock size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <View style={styles.stepContainer}>
                <View
                  style={[
                    styles.circle,
                    isActive && styles.activeCircle,
                    isCompleted && styles.completedCircle,
                  ]}
                >
                  {renderIcon(step.icon, isActive, isCompleted)}
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    isActive && styles.activeStepTitle,
                    isCompleted && styles.completedStepTitle,
                  ]}
                  numberOfLines={1}
                >
                  {step.title}
                </Text>
              </View>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <View
                  style={[styles.line, isCompleted && styles.completedLine]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepContainer: {
    alignItems: "center",
    width: 60,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#94a3b8",
  },
  activeCircle: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  completedCircle: {
    borderColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
  line: {
    height: 2,
    backgroundColor: "#e2e8f0",
    flex: 1,
    marginHorizontal: -10,
  },
  completedLine: {
    backgroundColor: "#10b981",
  },
  stepTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  activeStepTitle: {
    color: "#3b82f6",
    fontFamily: "Inter-SemiBold",
  },
  completedStepTitle: {
    color: "#10b981",
    fontFamily: "Inter-SemiBold",
  },
});
