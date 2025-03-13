export interface Order {
    id: number;
    traveler: {
      profile: {
        firstName: string;
        lastName: string;
        image?: { url: string };
      };
    };
    request: {
      goodsLocation: string;
      goodsDestination: string;
      goods: any;
      user: any;
    };
    totalAmount: number;
    createdAt: string;
    payment: {
      amount: number;
      status: 'PENDING' | 'COMPLETED' | 'REFUND' | 'FAILED' | 'PROCCESSING';
    }[];
    orderStatus: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
    pickup?: {
      location: string;
      scheduledTime: string | null;
    } | null;
    goodsProcess?: {
      status: string;
      events: any[];
    };
  }
  