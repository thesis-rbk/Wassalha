export interface Good {
    id: number;
    name: string;
    size: string;
    weight: number;
    price: number;
    description: string;
    isVerified: boolean;
    image: { url: string } | null; 
    category: { name: string }; 
  }