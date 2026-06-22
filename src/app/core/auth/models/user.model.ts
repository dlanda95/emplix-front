export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
