import React, { useState } from "react";
import { OnboardingScreen } from "./OnboardingScreen";
import { OnboardingContainerProps } from "@/types/OnboardingContainerProps";

const onboardingData = [
  {
    image: require("../../assets/images/onboarding/global-delivery.png"),
    title: "Global Package Delivery",
    description:
      "Connect with travelers worldwide and get your packages delivered across borders seamlessly",
  },
  {
    image: require("../../assets/images/onboarding/secure-delivery.png"),
    title: "Safe & Secure Delivery",
    description:
      "Track your packages in real-time and enjoy secure transactions with verified travelers",
  },
  {
    image: require("../../assets/images/onboarding/earn-money.png"),
    title: "Earn While Traveling",
    description:
      "Make extra money by delivering packages along your travel route",
  },
];

export const OnboardingContainer = ({
  onComplete,
}: OnboardingContainerProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < onboardingData.length) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    // Just call onComplete - let the parent handle navigation
    if (onComplete) {
      onComplete();
    }
  };

  const currentScreen = onboardingData[currentStep - 1];

  return (
    <OnboardingScreen
      image={currentScreen.image}
      title={currentScreen.title}
      description={currentScreen.description}
      currentStep={currentStep}
      totalSteps={onboardingData.length}
      onNext={handleNext}
      onSkip={handleSkip}
      isLastScreen={currentStep === onboardingData.length}
    />
  );
};
