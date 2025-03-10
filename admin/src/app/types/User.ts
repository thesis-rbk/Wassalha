export interface User {
    id: number;
    name: string;
    email: string;
    password: string; 
    phoneNumber?: string;
    role: string;
    profile?: {
        firstName: string;
        lastName: string;
        bio?: string;
        country?: string;
        gender?: string;
        image?: {
            id?: number;
            url: string;
            type?: string;
        };
    }
}
