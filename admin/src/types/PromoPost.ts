export interface PromoPost {
    id: number;
    title: string;
    content: string;
    publisher: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    category: {
      name: string;
    };
    createdAt: string;
  }
  