export interface GoodsPost {
    id: number;
    title: string;
    content: string;
    arrivalDate: string;
    availableKg: number;
    phoneNumber: string;
    airportLocation: string;
    traveler: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    category: {
      name: string;
    };
  }