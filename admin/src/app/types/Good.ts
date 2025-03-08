export interface Good {
    id: number;
    name: string;
    size: string;
    weight: number;
    price: number;
    description: string;
    isVerified: boolean;
    image: { url: string } | null; // Assuming image is an object with a URL
    category: { name: string }; // Assuming category has a name
  }