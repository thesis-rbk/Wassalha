// Define illegal items directly in the service
const illegalItemsData = {
  "illegal_items": [
    {
      "category": "Art & Antiques",
      "products": [
        "Antiques (Unregistered or unauthorized antiques)",
        "Arts and Antique Objects (Especially those that are stolen, smuggled, or culturally sensitive)",
        "Cultural Heritage Objects (Items illegally removed from archaeological sites or that belong to cultural heritage)",
        "Objects of Religious Significance (Artifacts or religious items considered sacred or culturally important)",
        "Fossils and Rare Artifacts (Stolen fossils or items of prehistoric importance)"
      ]
    },
    {
      "category": "Animal & Plant Products",
      "products": [
        "Animal skins",
        "Ivory",
        "Palm trees, branch of palm trees, and their derivatives",
        "Henna",
        "Animals and plants threatened with extinction (under the 'CITES' convention)"
      ]
    },
    {
      "category": "Military & Security Equipment",
      "products": [
        "Military Equipment",
        "Radar Equipment",
        "Weapons (except authorized hunting weapons)",
        "Explosives",
        "Gunpowder salt",
        "Ammunition"
      ]
    },
    {
      "category": "Financial Items & Documents",
      "products": [
        "Passports",
        "All Bank Cards",
        "Counterfeit currency",
        "Fake financial documents"
      ]
    },
    {
      "category": "Health & Pharmaceuticals",
      "products": [
        "Body Building Health Supplements (Proteins)",
        "Narcotic drugs and other psychotropic products",
        "Unregistered medications",
        "Expired pharmaceutical products",
        "Unapproved medical devices"
      ]
    },
    {
      "category": "Jewelry & Valuables",
      "products": [
        "Jewelry",
        "Precious stones",
        "Precious metals"
      ]
    },
    {
      "category": "Tobacco & Related Products",
      "products": [
        "Tobacco",
        "Cigarettes",
        "Electronic cigarettes"
      ]
    },
    {
      "category": "Counterfeit & Restricted Commercial Goods",
      "products": [
        "Counterfeit items",
        "Thrift stores (old and used clothes for commercial purposes)",
        "Fake designer brands",
        "Pirated software and media"
      ]
    },
    {
      "category": "Drones & Technology",
      "products": [
        "Drone",
        "Unregistered telecommunication equipment",
        "Illegal surveillance devices"
      ]
    },
    {
      "category": "Culturally Sensitive Items",
      "products": [
        "Any item offensive to the local culture",
        "Pornographic material",
        "Items promoting religious hatred",
        "Obscene literature or media"
      ]
    }
  ]
};

/**
 * Service for the Wassalha Assistant chatbot
 */
export const AssistantService = {
  /**
   * Get all illegal item categories and their products
   */
  getIllegalItems() {
    return illegalItemsData.illegal_items;
  },

  /**
   * Get common Wassalha FAQs for the assistant to reference
   */
  getWassalhaFAQs() {
    return [
      {
        question: "What is Wassalha?",
        answer: "Wassalha is a cross-platform app designed for seamless package delivery between countries. Our service connects travelers with people who need items delivered, creating a community-based delivery network."
      },
      {
        question: "How does Wassalha work?",
        answer: "Wassalha works by connecting travelers who have extra luggage space with people who need items delivered. Sponsors post delivery requests, travelers accept them, and Wassalha facilitates the entire process including payment, tracking, and verification."
      },
      {
        question: "What is the difference between a traveler and a sponsor?",
        answer: "A traveler is someone who is traveling between countries and has space in their luggage to carry items. A sponsor is someone who needs an item delivered from one country to another and is willing to pay for the service."
      },
      {
        question: "How do I become a traveler on Wassalha?",
        answer: "To become a traveler, you need to create an account, complete your profile, verify your identity, and select the 'Become a Traveler' option. You'll need to provide details about your travel plans and available luggage space."
      },
      {
        question: "How do I track my order?",
        answer: "You can track your order through the app by going to the Orders section and selecting your specific order. There, you'll see real-time updates on your order's status, location, and estimated delivery time."
      },
      {
        question: "What items are prohibited from being transported?",
        answer: "Wassalha prohibits transportation of illegal or dangerous items including but not limited to: weapons, drugs, counterfeit goods, protected wildlife products, and cultural artifacts. Please check our comprehensive prohibited items list for details."
      },
      {
        question: "How does payment work?",
        answer: "Payments are processed securely through the Wassalha platform. When a sponsor creates a delivery request, the payment is held in escrow and only released to the traveler once the delivery is confirmed complete by the recipient."
      },
      {
        question: "What happens if my item is lost or damaged?",
        answer: "Wassalha offers protection for items up to a certain value. If an item is lost or damaged, you should report it immediately through the app. Our support team will investigate the situation and process any applicable compensation."
      },
      {
        question: "How do I contact Wassalha support?",
        answer: "You can contact Wassalha support through the Help section in the app, by email at support@wassalha.com, or through our website's contact form. Our support team is available to assist you with any issues or questions."
      },
      {
        question: "Is there a size or weight limit for items?",
        answer: "Yes, items must fit within a traveler's personal luggage allowance. Typically, items should not exceed 5kg in weight and must be of reasonable dimensions. The exact limits depend on the traveler's available space and airline restrictions."
      }
    ];
  },

  /**
   * Get information about Wassalha service features
   */
  getServiceFeatures() {
    return {
      delivery: {
        description: "International package delivery service connecting travelers with extra luggage space to people who need items transported",
        benefits: [
          "Cost-effective alternative to traditional shipping",
          "Faster delivery times for certain routes",
          "Ability to transport items that might be difficult to ship conventionally",
          "Personal handling of packages"
        ]
      },
      travelerBenefits: {
        description: "Benefits for users who transport items as travelers",
        benefits: [
          "Earn money with existing travel plans",
          "Offset travel costs",
          "Help others get items they need",
          "Build reputation and receive positive reviews"
        ]
      },
      sponsorBenefits: {
        description: "Benefits for users who need items transported (sponsors)",
        benefits: [
          "Get items delivered that may be unavailable locally",
          "Save on international shipping costs",
          "Transport personal items safely",
          "Track delivery progress in real-time"
        ]
      },
      security: {
        description: "Security features to ensure safe and legal transport",
        features: [
          "Identity verification for all users",
          "Secure payment system with escrow protection",
          "Item verification process",
          "Prohibited items screening",
          "Insurance options for valuable items"
        ]
      }
    };
  },

  /**
   * Get order status explanations
   */
  getOrderStatusInfo() {
    return {
      pending: "Your order has been created but not yet accepted by a traveler.",
      accepted: "A traveler has accepted your delivery request and will be handling your package.",
      in_transit: "Your package is currently being transported by the traveler.",
      delivered: "Your package has been successfully delivered to the recipient.",
      completed: "The delivery has been confirmed complete by all parties.",
      cancelled: "The order has been cancelled.",
      disputed: "There is a dispute regarding this order that is being resolved by Wassalha support."
    };
  }
};

export default AssistantService; 