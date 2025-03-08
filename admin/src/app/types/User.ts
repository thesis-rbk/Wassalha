export interface User {
    id: number;
    name: string;
    email: string;
    password: string; 
    phoneNumber?: string;
    role: string;
    profile: {
      firstName: string;
      lastName: string;
      image?: {url:string}; 
      country?: string;
      gender?: string;
    }
}
