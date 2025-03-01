export interface AuthState {
    token: string | null;
    user: { id: number; name: string; email: string } | null;
    loading: boolean;
    error: string | null;
  }
