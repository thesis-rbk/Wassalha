// Extend the global Window interface
declare global {
  interface Window {
    handleGoogleAuth?: (response: any) => Promise<void>;
    google?: any;
  }
}

// Export a dummy type so the file is recognized as a module
export type GoogleAuthResponse = {
  credential: string;
};