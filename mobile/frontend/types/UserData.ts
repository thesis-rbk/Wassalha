export interface UserData {
    id: number;
    name: string;
    profile?: {
      firstName?: string;
      image?: {
        url: string;
      };
    };
  }
  