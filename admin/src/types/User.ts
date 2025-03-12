export interface User {
    id: number;
    name: string;
    email: string;
    password: string; 
   
    role: string;
    profile?: {
        firstName: string;
        lastName: string;
         bio?: string;
         country?: string;
         phoneNumber?: string;
    image?: {
        url: string;
        type?: string;
        mimeType?: string;
    };
    gender?: string;
    isBanned: boolean;
    isVerified: boolean;
    review?: string;
    }
}
