export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: string;
}
