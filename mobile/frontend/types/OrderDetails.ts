export interface OrderDetails {
    id: number;
    requestId: number;
    travelerId: number;
    request: {
      id: number;
      userId: number;
      goodsId: number;
      user: {
        id: number;
        name: string;
        email: string;
        phoneNumber?: string;
      };
      goods?: {
        name: string;
      };
    };
    traveler: {
      id: number;
      name: string;
      email: string;
      phoneNumber?: string;
    };
  }