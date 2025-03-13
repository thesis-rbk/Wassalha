export interface Request {
    id: number;
    user: {
      name: string; // Assuming the user has a name field
    };
    goods: {
      name: string; // Changed from title to name to match the schema
      description: string; // Assuming goods have a description
    };
    pickup: {
      location: string; // Pickup location
      scheduledTime: string; // Scheduled pickup time
    };
    order: {
      status: string; // Order status
    };
    quantity: number;
    goodsLocation: string;
    goodsDestination: string;
    date: string;
    withBox: boolean;
    createdAt: string;
  }